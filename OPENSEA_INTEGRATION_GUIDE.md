# 📘 GALLERYPIA OpenSea API 연동 가이드

## ✅ 확인 완료 사항

**OpenSea API 연동 기능이 이미 완벽하게 구현되어 있습니다!**

---

## 🎯 OpenSea API 연동 기능 개요

GALLERYPIA 관리자 대시보드에서 OpenSea의 NFT 컬렉션을 직접 가져와서 자동으로 등록할 수 있습니다.

### 주요 기능:
1. **단일 NFT 가져오기** - Contract Address와 Token ID로 개별 NFT 등록
2. **컬렉션 일괄 가져오기** - OpenSea 컬렉션 전체를 한 번에 가져오기 (최대 50개)
3. **자동 작가 생성** - OpenSea 크리에이터 정보로 작가 자동 등록
4. **메타데이터 저장** - OpenSea 원본 메타데이터 백업
5. **중복 방지** - 이미 등록된 NFT는 자동으로 건너뛰기

---

## 🔧 설정 방법

### Step 1: OpenSea API 키 발급받기

1. **OpenSea 계정 생성/로그인**
   - https://opensea.io/ 접속
   - 계정 생성 또는 로그인

2. **API 키 발급**
   - OpenSea Developer Portal 접속: https://docs.opensea.io/reference/api-overview
   - "Get API Key" 버튼 클릭
   - 프로젝트 정보 입력
   - API 키 복사 (예: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: GALLERYPIA에 API 키 등록

#### 방법 1: API 직접 호출 (추천)

```bash
# 로컬에서 실행하거나 터미널에서 실행
curl -X POST https://caa83bd3.gallerypia.pages.dev/api/opensea/set-api-key \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"api_key":"YOUR_OPENSEA_API_KEY"}'
```

**SESSION_TOKEN 얻는 방법:**
1. https://caa83bd3.gallerypia.pages.dev/login 로그인
2. 브라우저 개발자 도구 (F12) → Console 탭
3. 다음 명령어 실행:
   ```javascript
   localStorage.getItem('session_token')
   ```
4. 출력된 토큰 복사

#### 방법 2: 데이터베이스 직접 입력

```bash
cd /home/user/webapp

# 프로덕션 데이터베이스에 API 키 저장
export CLOUDFLARE_API_TOKEN="c-tVGqyWyTCBTcTox345ewV_H1r0MAo5t2Ul5D_D"

npx wrangler d1 execute gallerypia-production --remote \
  --command="INSERT INTO system_settings (setting_key, setting_value, is_sensitive, updated_at, updated_by) VALUES ('opensea_api_key', 'YOUR_OPENSEA_API_KEY', 1, datetime('now'), 1) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime('now')"
```

**주의:** `YOUR_OPENSEA_API_KEY`를 실제 발급받은 키로 변경하세요!

---

## 🚀 사용 방법

### 1. 관리자 대시보드 접속

1. https://caa83bd3.gallerypia.pages.dev/login 로그인
   - 이메일: `admin@gallerypia.com`
   - 비밀번호: `admin123`

2. 자동으로 관리자 대시보드로 이동

### 2. OpenSea에서 컬렉션 가져오기

#### 단계별 가이드:

**Step 1:** 관리자 대시보드 → "작품 관리" 탭 (기본 활성화)

**Step 2:** 우측 상단 **"OpenSea에서 가져오기"** 버튼 클릭 (청록색 버튼)

**Step 3:** 모달 창에서 정보 입력
- **컬렉션 슬러그:** OpenSea URL에서 컬렉션 이름
  - 예시 URL: `https://opensea.io/collection/cryptopunks`
  - 슬러그: `cryptopunks`
- **가져올 개수:** 1~50개 (기본 10개)

**Step 4:** "가져오기" 버튼 클릭

**Step 5:** 처리 완료 대기 (10~30초)
- 성공 시: "X개의 작품을 성공적으로 가져왔습니다" 알림
- 실패 시: 오류 메시지 확인

### 3. 가져온 작품 확인

- 작품 관리 탭의 테이블에서 새로 등록된 작품 확인
- 상태: "민팅됨" (minted)
- 카테고리: "Digital Art"로 자동 분류

---

## 📝 OpenSea 컬렉션 슬러그 찾는 방법

### 예시:

| OpenSea URL | 컬렉션 슬러그 |
|-------------|---------------|
| `https://opensea.io/collection/cryptopunks` | `cryptopunks` |
| `https://opensea.io/collection/boredapeyachtclub` | `boredapeyachtclub` |
| `https://opensea.io/collection/mutant-ape-yacht-club` | `mutant-ape-yacht-club` |
| `https://opensea.io/collection/azuki` | `azuki` |
| `https://opensea.io/collection/doodles-official` | `doodles-official` |

**팁:** OpenSea에서 원하는 컬렉션 페이지 URL의 `/collection/` 다음 부분을 복사하세요.

---

## 🔍 API 엔드포인트 (개발자용)

### 1. OpenSea API 키 설정

```http
POST /api/opensea/set-api-key
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "api_key": "your-opensea-api-key"
}
```

**응답:**
```json
{
  "success": true,
  "message": "OpenSea API 키가 설정되었습니다"
}
```

### 2. 단일 NFT 가져오기

```http
POST /api/opensea/import-nft
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "contract_address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  "token_id": "1"
}
```

**응답:**
```json
{
  "success": true,
  "message": "NFT가 성공적으로 등록되었습니다",
  "artwork_id": 123,
  "nft_data": {
    "name": "BoredApe #1",
    "image_url": "https://...",
    "opensea_url": "https://opensea.io/assets/ethereum/0xbc4.../1"
  }
}
```

### 3. 컬렉션 일괄 가져오기

```http
POST /api/opensea/import-collection
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "collection_slug": "boredapeyachtclub",
  "limit": 20
}
```

**응답:**
```json
{
  "success": true,
  "message": "15개의 NFT가 성공적으로 등록되었습니다",
  "job_id": 5,
  "stats": {
    "imported": 15,
    "failed": 5,
    "total": 20
  }
}
```

### 4. 가져오기 작업 상태 확인

```http
GET /api/opensea/job/{jobId}
Authorization: Bearer {session_token}
```

**응답:**
```json
{
  "success": true,
  "job": {
    "id": 5,
    "job_type": "collection_import",
    "collection_slug": "boredapeyachtclub",
    "status": "completed",
    "total_items": 20,
    "processed_items": 15,
    "failed_items": 5,
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:31:45Z"
  }
}
```

---

## 🗄️ 데이터베이스 구조

### opensea_artwork_mapping 테이블

OpenSea에서 가져온 NFT의 원본 정보를 저장합니다.

```sql
CREATE TABLE opensea_artwork_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,           -- GALLERYPIA 작품 ID
  contract_address TEXT NOT NULL,        -- 이더리움 컨트랙트 주소
  token_id TEXT NOT NULL,                -- NFT 토큰 ID
  collection_slug TEXT,                  -- OpenSea 컬렉션 슬러그
  opensea_url TEXT,                      -- OpenSea 작품 URL
  opensea_metadata TEXT,                 -- 원본 JSON 메타데이터
  last_synced_at DATETIME,               -- 마지막 동기화 시간
  UNIQUE(contract_address, token_id)     -- 중복 방지
);
```

### opensea_sync_jobs 테이블

일괄 가져오기 작업의 진행 상태를 추적합니다.

```sql
CREATE TABLE opensea_sync_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_type TEXT NOT NULL,                -- 'collection_import' 등
  collection_slug TEXT,                  -- 컬렉션 슬러그
  status TEXT DEFAULT 'pending',         -- pending, running, completed, failed
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  imported_artworks TEXT,                -- JSON 배열 (artwork_ids)
  error_log TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

### system_settings 테이블

OpenSea API 키를 안전하게 저장합니다.

```sql
CREATE TABLE system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,      -- 'opensea_api_key'
  setting_value TEXT,                    -- 실제 API 키 값
  is_sensitive INTEGER DEFAULT 0,        -- 1 = 민감 정보
  updated_at DATETIME,
  updated_by INTEGER
);
```

---

## ⚠️ 주의사항 및 제한사항

### OpenSea API 제한
- **Rate Limit:** 무료 플랜은 분당 2회 요청 제한
- **컬렉션 크기:** 한 번에 최대 50개 NFT 가져오기 가능
- **API 키 필수:** OpenSea API 키가 없으면 작동하지 않음

### GALLERYPIA 제한
- **관리자 권한 필요:** `super_admin` 역할만 OpenSea 가져오기 가능
- **중복 NFT:** 같은 Contract Address + Token ID는 한 번만 등록됨
- **작가 자동 생성:** OpenSea 크리에이터 정보가 없으면 컬렉션명으로 작가 생성

### 데이터 동기화
- **일방향 동기화:** GALLERYPIA → OpenSea 동기화는 지원하지 않음
- **메타데이터 업데이트:** 가져온 후 OpenSea의 변경사항은 자동 반영되지 않음
- **수동 재동기화:** 필요시 관리자가 수동으로 작품 정보 수정

---

## 🛠️ 트러블슈팅

### 1. "OpenSea API 키가 설정되지 않았습니다" 오류

**원인:** OpenSea API 키가 데이터베이스에 저장되지 않음

**해결방법:**
```bash
# API 키 확인
npx wrangler d1 execute gallerypia-production --remote \
  --command="SELECT * FROM system_settings WHERE setting_key='opensea_api_key'"

# 결과가 없으면 API 키 등록
npx wrangler d1 execute gallerypia-production --remote \
  --command="INSERT INTO system_settings (setting_key, setting_value, is_sensitive, updated_at, updated_by) VALUES ('opensea_api_key', 'YOUR_API_KEY', 1, datetime('now'), 1)"
```

### 2. "OpenSea API 요청 실패" 오류

**가능한 원인:**
- 잘못된 API 키
- Rate limit 초과 (분당 2회 제한)
- 존재하지 않는 컬렉션 슬러그
- OpenSea 서버 문제

**해결방법:**
1. API 키 유효성 확인
2. 1분 대기 후 재시도
3. OpenSea에서 컬렉션 슬러그 재확인
4. OpenSea 상태 페이지 확인: https://status.opensea.io/

### 3. "관리자 권한이 필요합니다" 오류

**원인:** 현재 로그인한 계정이 `super_admin` 역할이 아님

**해결방법:**
```bash
# 사용자 역할 확인
npx wrangler d1 execute gallerypia-production --remote \
  --command="SELECT id, email, role FROM users WHERE email='admin@gallerypia.com'"

# 관리자 역할 부여 (필요시)
npx wrangler d1 execute gallerypia-production --remote \
  --command="UPDATE users SET role='super_admin' WHERE email='admin@gallerypia.com'"
```

### 4. 가져온 작품이 표시되지 않음

**원인:** 브라우저 캐시 또는 페이지 새로고침 필요

**해결방법:**
1. 브라우저에서 `Ctrl + F5` (강력 새로고침)
2. 관리자 대시보드 재접속
3. 작품 관리 탭에서 "최신순" 정렬 선택

---

## 📊 사용 예시

### 예시 1: CryptoPunks 10개 가져오기

1. 관리자 대시보드 접속
2. "OpenSea에서 가져오기" 버튼 클릭
3. 컬렉션 슬러그: `cryptopunks`
4. 가져올 개수: `10`
5. "가져오기" 버튼 클릭

**예상 결과:**
- CryptoPunks 10개가 GALLERYPIA에 자동 등록
- 작가명: "cryptopunks" (컬렉션명)
- 카테고리: "Digital Art"
- 상태: "민팅됨"
- OpenSea 원본 URL 링크 포함

### 예시 2: Azuki 컬렉션 20개 가져오기

1. OpenSea에서 Azuki 컬렉션 URL 확인: `https://opensea.io/collection/azuki`
2. 컬렉션 슬러그 복사: `azuki`
3. GALLERYPIA 관리자 대시보드에서 가져오기
4. 20개 작품 자동 등록

---

## 🔗 추가 자료

- **OpenSea API 문서:** https://docs.opensea.io/reference/api-overview
- **OpenSea 개발자 포털:** https://opensea.io/developers
- **GALLERYPIA 관리자 대시보드:** https://caa83bd3.gallerypia.pages.dev/admin/dashboard
- **GALLERYPIA 로그인:** https://caa83bd3.gallerypia.pages.dev/login

---

## 📞 지원

문제가 발생하면 다음 정보를 확인하세요:

1. **브라우저 콘솔:** F12 → Console 탭에서 오류 메시지 확인
2. **네트워크 탭:** F12 → Network 탭에서 API 요청 상태 확인
3. **데이터베이스 확인:** Wrangler CLI로 직접 데이터 조회

---

**마지막 업데이트:** 2024-01-15  
**버전:** GALLERYPIA v6.0
