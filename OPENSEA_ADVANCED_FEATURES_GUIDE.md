# OpenSea 고급 기능 사용 가이드

## 📋 개요

갤러리피아 v8.14에서 추가된 OpenSea 고급 연동 기능 사용 방법을 안내합니다.

## 🚀 구현된 기능

### 1. ✅ OpenSea API 키 통합
- 4가지 Fallback 시스템으로 안정적인 NFT 조회
- API 키 없이도 기본 기능 사용 가능
- 환경 변수로 API 키 관리

### 2. ✅ 배치 Import (여러 NFT 동시)
- 최대 50개 NFT를 CSV 형식으로 한 번에 가져오기
- 진행률 실시간 표시
- 성공/실패 개별 추적
- 미리보기 이미지 제공

### 3. ✅ 컬렉션 전체 Import
- 컬렉션 슬러그로 전체 NFT 조회
- 최대 200개까지 가져오기
- 컬렉션 메타데이터 미리보기
- 자동 작품 등록

### 4. ✅ 자동 가격 업데이트
- OpenSea floor price 기반 가격 갱신
- 모든 민팅된 NFT 자동 업데이트
- ETH → KRW 환율 자동 변환 (1 ETH = 3,000,000 KRW)
- Rate limit 보호 (200ms 지연)

### 5. ⏳ NFT 소유권 추적 (미구현)
- 블록체인 기반 소유권 이력 추적
- 소유권 변경 이벤트 기록
- 향후 버전에서 구현 예정

### 6. ⏳ 거래 이력 Import (미구현)
- OpenSea 거래 내역 가져오기
- 과거 판매 데이터 분석
- 향후 버전에서 구현 예정

## 🔧 API 키 설정

### 개발 환경 (.dev.vars)

```bash
# .dev.vars 파일 생성
OPENSEA_API_KEY=your-opensea-api-key
ALCHEMY_API_KEY=your-alchemy-api-key
INFURA_API_KEY=your-infura-api-key
```

### 프로덕션 환경 (Cloudflare)

```bash
# Cloudflare Pages 시크릿 설정
npx wrangler pages secret put OPENSEA_API_KEY --project-name gallerypia
npx wrangler pages secret put ALCHEMY_API_KEY --project-name gallerypia
npx wrangler pages secret put INFURA_API_KEY --project-name gallerypia
```

### API 키 발급 방법

1. **OpenSea API 키**: https://docs.opensea.io/reference/api-keys
   - 무료 tier: 매월 제한적 요청
   - Pro tier: 더 많은 요청 가능

2. **Alchemy API 키**: https://www.alchemy.com/
   - NFT API 무료 tier 제공
   - NFT 메타데이터 조회

3. **Infura API 키**: https://infura.io/
   - Ethereum 노드 접근
   - 백업 데이터 소스

## 📖 사용 방법

### 1. 단일 NFT 가져오기

**UI 경로**: 관리자 대시보드 → OpenSea 가져오기 → 단일 NFT

**API 엔드포인트**:
```bash
POST /api/admin/opensea/fetch
Content-Type: application/json

{
  "chain": "ethereum",
  "contract_address": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  "token_id": "1"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "name": "Bored Ape #1",
    "description": "...",
    "image_url": "https://...",
    "contract_address": "0x...",
    "token_id": "1",
    "chain": "ethereum",
    "creator": "Yuga Labs",
    "collection": {
      "name": "Bored Ape Yacht Club",
      "slug": "boredapeyachtclub"
    },
    "traits": [...],
    "opensea_url": "https://opensea.io/assets/ethereum/0x.../1"
  }
}
```

### 2. 배치 Import (여러 NFT 동시)

**UI 경로**: 관리자 대시보드 → OpenSea 가져오기 → 배치 Import

**입력 형식 (CSV)**:
```
0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D,1
0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D,2
0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D,3
```

**API 엔드포인트**:
```bash
POST /api/admin/opensea/batch-fetch
Content-Type: application/json

{
  "nfts": [
    {
      "chain": "ethereum",
      "contract_address": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      "token_id": "1"
    },
    {
      "chain": "ethereum",
      "contract_address": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      "token_id": "2"
    }
  ]
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "nfts": [...]
  }
}
```

**제한사항**:
- 최대 50개까지 한 번에 가져오기 가능
- 51개 이상 시도 시 400 에러

### 3. 컬렉션 전체 Import

**UI 경로**: 관리자 대시보드 → OpenSea 가져오기 → 컬렉션 Import

**API 엔드포인트**:
```bash
POST /api/admin/opensea/collection-fetch
Content-Type: application/json

{
  "collection_slug": "boredapeyachtclub",
  "limit": 20
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "collection": {
      "name": "Bored Ape Yacht Club",
      "description": "...",
      "image_url": "https://...",
      "total_supply": 10000,
      "floor_price": 25.5,
      "owners": 6000
    },
    "nfts": [...],
    "total": 20
  }
}
```

**제한사항**:
- 최대 200개까지 가져오기 가능
- OpenSea API 키 필수
- API 키 없으면 401 에러

### 4. 자동 가격 업데이트

**UI 경로**: 관리자 대시보드 → 가격 업데이트 버튼

**API 엔드포인트**:
```bash
POST /api/admin/opensea/update-prices
Content-Type: application/json
```

**응답**:
```json
{
  "success": true,
  "updated": 15,
  "total": 20,
  "message": "15개 작품의 가격이 업데이트되었습니다."
}
```

**동작 방식**:
1. 데이터베이스에서 모든 민팅된 NFT 조회 (최대 100개)
2. 각 NFT의 OpenSea floor price 조회
3. ETH → KRW 환율 변환 (1 ETH = 3,000,000 KRW)
4. estimated_value 컬럼 업데이트
5. 200ms 지연으로 rate limit 방지

## 🔄 Fallback 시스템

API 호출 실패 시 자동으로 다음 방법 시도:

1. **Method 1**: OpenSea API v2 (with API key)
   - 가장 정확하고 빠름
   - API 키 필요
   - 실패 시 Method 2로

2. **Method 2**: OpenSea API v2 (without API key)
   - API 키 없어도 작동
   - 제한적 요청
   - 실패 시 Method 3으로

3. **Method 3**: OpenSea API v1
   - 구 버전 API
   - 호환성 좋음
   - 실패 시 Method 4로

4. **Method 4**: Alchemy NFT API
   - 대체 데이터 소스
   - Alchemy API 키 필요
   - 실패 시 플레이스홀더 데이터 반환

## 🧪 테스트 방법

### 로컬 개발 서버

```bash
# 1. 환경 변수 설정
cat > .dev.vars << EOF
OPENSEA_API_KEY=your-key
ALCHEMY_API_KEY=your-key
EOF

# 2. 빌드 및 시작
npm run build
pm2 restart gallerypia

# 3. 테스트
curl -X POST http://localhost:3000/api/admin/opensea/fetch \
  -H "Content-Type: application/json" \
  -d '{"chain":"ethereum","contract_address":"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D","token_id":"1"}'
```

### 프로덕션 테스트

```bash
# Cloudflare Pages에서 테스트
curl -X POST https://gallerypia.pages.dev/api/admin/opensea/fetch \
  -H "Content-Type: application/json" \
  -d '{"chain":"ethereum","contract_address":"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D","token_id":"1"}'
```

## ⚠️ 주의사항

### Rate Limiting
- OpenSea API는 요청 제한이 있습니다
- 배치 작업 시 자동으로 지연 추가
- 대량 작업 시 여러 번 나눠서 실행 권장

### API 키 보안
- `.dev.vars` 파일은 git에 커밋하지 마세요
- 프로덕션에서는 Cloudflare Secrets 사용
- 환경 변수로만 관리

### 데이터 품질
- API 키 없으면 제한적 데이터만 가져옴
- 이미지 URL은 임시 링크일 수 있음
- 중요한 데이터는 수동 검증 권장

### 네트워크 의존성
- OpenSea API가 다운되면 작동 안 함
- Fallback 시스템으로 일부 완화
- 로컬 캐싱 구현 권장 (향후)

## 🐛 문제 해결

### "컬렉션을 찾을 수 없습니다"
- OpenSea API 키가 설정되지 않았거나 만료됨
- 컬렉션 슬러그가 잘못됨
- API 요청 제한 초과

**해결 방법**:
```bash
# API 키 확인
echo $OPENSEA_API_KEY

# 새 API 키 발급
# https://docs.opensea.io/reference/api-keys

# Cloudflare에 다시 설정
npx wrangler pages secret put OPENSEA_API_KEY
```

### "최대 50개까지 가져올 수 있습니다"
- 배치 import에서 51개 이상 시도
- 여러 번 나눠서 실행하거나 컬렉션 import 사용

### "업데이트할 NFT가 없습니다"
- 민팅된 NFT가 없음
- `is_minted = 1`이고 `nft_contract_address`가 있는 작품이 필요

### API 응답이 느림
- OpenSea API는 때때로 느릴 수 있음
- Rate limit에 걸려 지연될 수 있음
- 인내심을 갖고 기다리거나 나중에 다시 시도

## 📈 향후 계획

### 단기 (1-2주)
- ✅ API 키 통합 (완료)
- ✅ 배치 import (완료)
- ✅ 컬렉션 import (완료)
- ✅ 자동 가격 업데이트 (완료)

### 중기 (1-2개월)
- ⏳ NFT 소유권 추적
  - ownership_history 테이블 추가
  - 블록체인 이벤트 모니터링
  - 소유권 변경 알림
  
- ⏳ 거래 이력 import
  - transaction_history 테이블 추가
  - OpenSea 판매 데이터 가져오기
  - 거래 타임라인 시각화

### 장기 (3-6개월)
- 🔮 실시간 가격 추적
- 🔮 시장 트렌드 분석
- 🔮 AI 기반 가격 예측
- 🔮 자동 알림 시스템

## 🤝 기여

버그 리포트나 기능 제안은 GitHub Issues에 남겨주세요.

## 📞 문의

- 이메일: gallerypia@gmail.com
- 개발자: 남현우 교수 (서경대학교)

---

**갤러리피아 v8.14** - OpenSea Integration Enhanced
