# GALLERYPIA v6.0 배포 가이드

## 로컬 컴퓨터에서 배포하기

### 필요 사항
- Node.js 설치
- 프로젝트 파일 다운로드: https://www.genspark.ai/api/files/s/kN7H0huS

### 배포 단계

1. **프로젝트 압축 해제**
```bash
tar -xzf gallerypia-v6-production-ready.tar.gz
cd home/user/webapp
```

2. **의존성 설치**
```bash
npm install
```

3. **Wrangler 로그인 (브라우저 열림)**
```bash
npx wrangler login
```

4. **D1 데이터베이스 생성**
```bash
npx wrangler d1 create gallerypia-production
```

결과에서 `database_id` 복사하여 `wrangler.jsonc`에 붙여넣기:
```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "gallerypia-production",
    "database_id": "여기에_복사한_ID_붙여넣기"
  }]
}
```

5. **마이그레이션 적용**
```bash
npx wrangler d1 migrations apply gallerypia-production
```

6. **Pages 프로젝트 생성**
```bash
npx wrangler pages project create gallerypia --production-branch main
```

7. **배포**
```bash
npx wrangler pages deploy dist --project-name gallerypia
```

8. **관리자 계정 설정**
```bash
# 프로덕션 DB에 admin 계정 생성
npx wrangler d1 execute gallerypia-production --command="INSERT INTO users (email, password_hash, username, full_name, role, is_active, created_at) VALUES ('admin@gallerypia.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Administrator', 'admin', 1, datetime('now'))"

npx wrangler d1 execute gallerypia-production --command="INSERT INTO user_roles (user_id, role, is_active) VALUES ((SELECT id FROM users WHERE email='admin@gallerypia.com'), 'admin', 1)"
```

## 로그인 정보

- 이메일: admin@gallerypia.com
- 비밀번호: admin123

## 배포 완료 후

배포가 완료되면 다음과 같은 URL을 받게 됩니다:
- Production: https://gallerypia.pages.dev
- 또는: https://랜덤ID.gallerypia.pages.dev

## 문제 해결

### D1 데이터베이스가 비어있다면
```bash
npx wrangler d1 migrations apply gallerypia-production
```

### 관리자 계정으로 로그인 안되면
```bash
npx wrangler d1 execute gallerypia-production --command="SELECT * FROM users"
```

