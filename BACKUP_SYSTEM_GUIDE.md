# 자동 백업 시스템 가이드

## 📋 개요

Cloudflare D1 데이터베이스의 자동 백업 및 복구 시스템입니다.

## 🎯 백업 전략

### 백업 종류
1. **자동 일일 백업** (Cloudflare Cron Trigger)
2. **수동 백업** (wrangler CLI)
3. **배포 전 백업** (CI/CD 통합)

### 백업 보존 정책
- 일일 백업: 7일 보존
- 주간 백업: 4주 보존
- 월간 백업: 12개월 보존

## 🔧 백업 구현

### 1. D1 Export API 사용

**백업 스크립트 (scripts/backup-d1.sh):**
```bash
#!/bin/bash
# D1 Database Backup Script

DATABASE_NAME="gallerypia-production"
DATABASE_ID="your-database-id"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Export database to SQL file
echo "🔄 Backing up ${DATABASE_NAME}..."
npx wrangler d1 export ${DATABASE_NAME} --output="${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_FILE}"
echo "✅ Backup completed: ${BACKUP_FILE}.gz"

# Upload to R2 storage
npx wrangler r2 object put gallerypia-backups/backup_${TIMESTAMP}.sql.gz --file="${BACKUP_FILE}.gz"
echo "☁️ Backup uploaded to R2 storage"

# Clean old backups (keep last 7 days)
find "${BACKUP_DIR}" -name "backup_*.sql.gz" -mtime +7 -delete
echo "🧹 Cleaned old backups"
```

### 2. Cloudflare Workers Cron 설정

**wrangler.jsonc:**
```jsonc
{
  "name": "gallerypia",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gallerypia-production",
      "database_id": "your-database-id"
    }
  ],
  "r2_buckets": [
    {
      "binding": "BACKUP_BUCKET",
      "bucket_name": "gallerypia-backups"
    }
  ],
  "triggers": {
    "crons": ["0 2 * * *"]  // 매일 새벽 2시 (UTC)
  }
}
```

**Cron Job Handler (src/cron/backup.ts):**
```typescript
import type { Context } from 'hono'

export async function scheduledBackup(c: Context) {
  const env = c.env
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupKey = `backup_${timestamp}.sql`
  
  try {
    // D1 Database Export
    const tables = await env.DB.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `).all()
    
    let sqlDump = '-- GalleryPia Database Backup\n'
    sqlDump += `-- Timestamp: ${timestamp}\n\n`
    
    for (const table of tables.results) {
      const tableName = table.name
      
      // Export table schema
      const schema = await env.DB.prepare(`
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name=?
      `).bind(tableName).first()
      
      sqlDump += `${schema.sql};\n\n`
      
      // Export table data
      const rows = await env.DB.prepare(`SELECT * FROM ${tableName}`).all()
      
      for (const row of rows.results) {
        const columns = Object.keys(row).join(', ')
        const values = Object.values(row)
          .map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v)
          .join(', ')
        
        sqlDump += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`
      }
      
      sqlDump += '\n'
    }
    
    // Upload to R2
    await env.BACKUP_BUCKET.put(backupKey, sqlDump, {
      httpMetadata: {
        contentType: 'application/sql'
      },
      customMetadata: {
        database: 'gallerypia-production',
        timestamp: timestamp
      }
    })
    
    console.log(`✅ Backup completed: ${backupKey}`)
    return { success: true, backup: backupKey }
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  }
}
```

**메인 앱 통합 (src/index.tsx):**
```typescript
import { scheduledBackup } from './cron/backup'

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    return app.fetch(request, env)
  },
  
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    // Cron trigger 핸들러
    ctx.waitUntil(scheduledBackup({ env } as Context))
  }
}
```

## 📥 복구 절차

### 1. 수동 복구

**로컬 복구:**
```bash
# Download backup from R2
npx wrangler r2 object get gallerypia-backups/backup_20241124_020000.sql.gz --file=restore.sql.gz

# Decompress
gunzip restore.sql.gz

# Restore to local database
npx wrangler d1 execute gallerypia-production --local --file=restore.sql
```

**프로덕션 복구:**
```bash
# ⚠️ WARNING: This will overwrite production data
npx wrangler d1 execute gallerypia-production --file=restore.sql
```

### 2. 자동 복구 스크립트

**scripts/restore-d1.sh:**
```bash
#!/bin/bash
# D1 Database Restore Script

if [ $# -eq 0 ]; then
    echo "Usage: ./restore-d1.sh <backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1
TEMP_SQL="temp_restore.sql"

# Decompress
gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"

# Ask for confirmation
read -p "⚠️ This will restore from ${BACKUP_FILE}. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Restore cancelled"
    rm "${TEMP_SQL}"
    exit 0
fi

# Restore
echo "🔄 Restoring database..."
npx wrangler d1 execute gallerypia-production --file="${TEMP_SQL}"

# Cleanup
rm "${TEMP_SQL}"
echo "✅ Restore completed"
```

### 3. 복구 검증

**scripts/verify-backup.sh:**
```bash
#!/bin/bash
# Verify backup integrity

BACKUP_FILE=$1

echo "🔍 Verifying backup: ${BACKUP_FILE}"

# Decompress and check SQL syntax
gunzip -c "${BACKUP_FILE}" | sqlite3 :memory: ".read /dev/stdin" ".schema"

if [ $? -eq 0 ]; then
    echo "✅ Backup is valid"
else
    echo "❌ Backup is corrupted"
    exit 1
fi

# Count tables
TABLE_COUNT=$(gunzip -c "${BACKUP_FILE}" | grep -c "CREATE TABLE")
echo "📊 Tables found: ${TABLE_COUNT}"

# Check for data
INSERT_COUNT=$(gunzip -c "${BACKUP_FILE}" | grep -c "INSERT INTO")
echo "📊 Insert statements: ${INSERT_COUNT}"
```

## 📊 백업 모니터링

### Backup Status API

**API 엔드포인트 (src/routes/admin.tsx):**
```typescript
app.get('/api/admin/backups', async (c) => {
  const env = c.env
  
  // List backups from R2
  const backups = await env.BACKUP_BUCKET.list({
    prefix: 'backup_'
  })
  
  const backupList = backups.objects.map(obj => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
    age: Math.floor((Date.now() - new Date(obj.uploaded).getTime()) / 86400000)
  }))
  
  return c.json({
    total: backupList.length,
    backups: backupList,
    oldest: backupList[backupList.length - 1]?.uploaded,
    newest: backupList[0]?.uploaded
  })
})

app.post('/api/admin/backup/trigger', async (c) => {
  // Manual backup trigger
  const result = await scheduledBackup(c)
  return c.json(result)
})
```

## 🔄 CI/CD 통합

**.github/workflows/backup-before-deploy.yml:**
```yaml
name: Backup Before Deploy

on:
  push:
    branches: [main]

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Wrangler
        run: npm install -g wrangler
      
      - name: Backup Database
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: |
          TIMESTAMP=$(date +%Y%m%d_%H%M%S)
          wrangler d1 export gallerypia-production --output=backup_pre_deploy_${TIMESTAMP}.sql
          gzip backup_pre_deploy_${TIMESTAMP}.sql
          wrangler r2 object put gallerypia-backups/deploy/backup_pre_deploy_${TIMESTAMP}.sql.gz --file=backup_pre_deploy_${TIMESTAMP}.sql.gz
```

## 📋 체크리스트

### 일일 작업
- [ ] 자동 백업 성공 확인 (Cloudflare Dashboard → Workers → Logs)
- [ ] R2 버킷에 새 백업 파일 확인

### 주간 작업
- [ ] 백업 무결성 검증 (`verify-backup.sh`)
- [ ] 복구 테스트 (로컬 환경)
- [ ] 오래된 백업 정리 확인

### 월간 작업
- [ ] 프로덕션 복구 테스트 (스테이징 환경)
- [ ] 백업 정책 검토
- [ ] 디스크 사용량 모니터링

## 🚨 비상 복구 절차

### 데이터 손실 시나리오

1. **즉시 조치**
   - 서비스 중단 (배포 롤백 또는 점검 모드)
   - 최신 백업 파일 확인

2. **복구 실행**
   ```bash
   # 최신 백업 다운로드
   npx wrangler r2 object get gallerypia-backups/$(npx wrangler r2 object list gallerypia-backups | head -1) --file=latest.sql.gz
   
   # 복구
   ./scripts/restore-d1.sh latest.sql.gz
   ```

3. **검증**
   ```bash
   # 데이터 무결성 확인
   curl https://gallerypia.pages.dev/api/admin/health
   
   # 레코드 수 확인
   npx wrangler d1 execute gallerypia-production --command="SELECT COUNT(*) FROM users"
   ```

4. **서비스 재개**
   - 복구 완료 확인
   - 서비스 재시작
   - 모니터링 강화

## 📚 참고 자료

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cron Triggers](https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/)
