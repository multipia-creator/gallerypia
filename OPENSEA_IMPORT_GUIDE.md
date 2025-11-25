# OpenSea NFT Import 기능 가이드

## 🎨 기능 개요

관리자 대시보드에서 OpenSea.io의 NFT 작품을 직접 가져와서 GALLERYPIA에 등록할 수 있는 기능입니다.

---

## 📋 주요 기능

### 1. **다양한 입력 방법 지원**
- ✅ OpenSea URL 직접 입력
- ✅ Contract Address + Token ID 직접 입력
- ✅ 5개 블록체인 네트워크 지원
  - Ethereum
  - Polygon
  - Arbitrum
  - Optimism
  - Base

### 2. **자동 메타데이터 가져오기**
- 작품명 (Name)
- 작품 설명 (Description)
- 이미지 URL
- 작가 정보 (Creator)
- 컬렉션 정보
- NFT 속성 (Traits)
- External URL
- OpenSea 링크

### 3. **다중 API 시도**
시스템이 자동으로 여러 방법을 시도합니다:
- OpenSea API v2
- OpenSea API v1 (backup)
- Alchemy NFT API (backup)
- Fallback: 기본 정보 제공

### 4. **실시간 미리보기**
- NFT 정보를 가져오면 실시간으로 미리보기 표시
- 이미지, 작품명, 작가, 설명, 속성 등 확인 가능

### 5. **자동 작가 등록**
- 작가가 DB에 없으면 자동으로 생성
- 기존 작가가 있으면 연결

---

## 🚀 사용 방법

### Step 1: 관리자 페이지 접속
```
URL: https://3000-iez4w2cmp5ni8h9drujyr-3844e1b6.sandbox.novita.ai/admin/dashboard
```

### Step 2: OpenSea에서 가져오기 버튼 클릭
- "작품 관리" 탭에서 "OpenSea에서 가져오기" 버튼 클릭
- 모달 창이 열립니다

### Step 3: NFT 정보 입력

**방법 1: URL 입력**
```
https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/1
```

**방법 2: 직접 입력**
```
Contract Address: 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d
Token ID: 1
Chain: Ethereum
```

### Step 4: NFT 정보 가져오기
- "NFT 정보 가져오기" 버튼 클릭
- 시스템이 자동으로 OpenSea에서 데이터 수집
- 미리보기에서 정보 확인

### Step 5: 갤러리에 등록
- "갤러리에 등록" 버튼 클릭
- 확인 메시지 후 자동으로 DB에 저장
- 작품 목록에서 확인 가능

---

## 🧪 테스트 예제

### 예제 1: Bored Ape Yacht Club
```json
{
  "chain": "ethereum",
  "contract_address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
  "token_id": "1"
}
```

### 예제 2: CryptoPunks
```json
{
  "chain": "ethereum",
  "contract_address": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  "token_id": "1234"
}
```

### 예제 3: Azuki
```json
{
  "chain": "ethereum",
  "contract_address": "0xed5af388653567af2f388e6224dc7c4b3241c544",
  "token_id": "100"
}
```

---

## 🔧 API 엔드포인트

### 1. NFT 정보 가져오기
```bash
POST /api/admin/opensea/fetch

Request Body:
{
  "chain": "ethereum",
  "contract_address": "0x...",
  "token_id": "123"
}

Response:
{
  "success": true,
  "data": {
    "name": "NFT Name",
    "description": "...",
    "image_url": "https://...",
    "creator": "Artist Name",
    "collection": {...},
    "traits": [...],
    "opensea_url": "https://opensea.io/..."
  }
}
```

### 2. NFT 등록하기
```bash
POST /api/admin/opensea/import

Request Body:
{
  "nft_data": {
    // fetch API에서 받은 데이터
  }
}

Response:
{
  "success": true,
  "message": "NFT가 성공적으로 등록되었습니다.",
  "artwork_id": 123
}
```

---

## 📊 등록된 작품 정보

### 자동 설정 항목
- **카테고리**: "디지털아트"
- **상태**: "approved" (즉시 승인)
- **is_minted**: true
- **블록체인 정보**: Contract Address, Token ID, Network
- **기본 평가 점수**:
  - 시장수요: 70점
  - 희소성: 75점
  - 예술적 완성도: 80점
  - 독창성: 75점
  - 문화적 의의: 70점
  - 기술적 우수성: 80점
- **기본 예상가**: 5,000,000원

### 작가 정보
- OpenSea creator 자동 등록
- 없으면 "Unknown Artist"로 등록
- Wallet address 저장

---

## ⚠️ 주의사항

### API 제한
- OpenSea API는 rate limit이 있을 수 있습니다
- API 호출 실패 시 기본 정보로 등록됩니다
- 필요시 수동으로 정보를 수정하세요

### 데이터 검증
- 등록 전 미리보기에서 정보를 확인하세요
- 이미지가 없으면 placeholder가 사용됩니다
- 작품 설명이 없으면 기본 텍스트가 입력됩니다

### 중복 방지
- 같은 NFT를 여러 번 등록할 수 있습니다
- Contract Address + Token ID로 중복 체크는 수동으로 확인하세요

---

## 🐛 트러블슈팅

### 문제 1: "NFT 정보를 가져올 수 없습니다"
**원인**: OpenSea API 제한 또는 네트워크 오류
**해결**: 
1. 잠시 후 다시 시도
2. Contract Address와 Token ID가 정확한지 확인
3. 다른 블록체인 네트워크 선택 시도

### 문제 2: "이미지가 표시되지 않습니다"
**원인**: 이미지 URL 접근 불가
**해결**:
1. OpenSea에서 직접 이미지 확인
2. 등록 후 관리자 페이지에서 수동으로 이미지 URL 수정

### 문제 3: "등록 후 작품이 보이지 않습니다"
**해결**:
1. 작품 목록 새로고침
2. 필터 설정 확인 (카테고리, 상태)
3. 검색 기능 사용

---

## 📈 향후 개선 계획

### Phase 2
- [ ] OpenSea API Key 지원 (안정적인 데이터 수집)
- [ ] 배치 import (여러 NFT 한 번에 가져오기)
- [ ] 컬렉션 전체 import
- [ ] 자동 가격 업데이트 (OpenSea floor price)
- [ ] NFT 소유권 추적
- [ ] 거래 이력 import

### Phase 3
- [ ] 다른 NFT 마켓플레이스 지원 (Rarible, Foundation)
- [ ] IPFS 메타데이터 직접 조회
- [ ] AI 기반 작품 분석 및 자동 평가

---

## 📞 문의

기능 개선 제안이나 버그 리포트는 개발팀에 문의해주세요.

**개발 완료일**: 2025-01-15
**버전**: 1.0.0
**Status**: ✅ Production Ready
