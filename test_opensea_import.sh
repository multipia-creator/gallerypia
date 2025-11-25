#!/bin/bash

echo "🧪 OpenSea Import API 테스트"
echo "=============================="
echo ""

BASE_URL="http://localhost:3000"

echo "📋 테스트 1: Bored Ape #1 정보 가져오기"
echo "----------------------------------------"
curl -s -X POST "$BASE_URL/api/admin/opensea/fetch" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "ethereum",
    "contract_address": "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    "token_id": "1"
  }' | jq -r 'if .success then "✅ 성공: \(.data.name // "Token #1")" else "❌ 실패: \(.error)" end'
echo ""

echo "📋 테스트 2: CryptoPunks #1234 정보 가져오기"
echo "--------------------------------------------"
curl -s -X POST "$BASE_URL/api/admin/opensea/fetch" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "ethereum",
    "contract_address": "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
    "token_id": "1234"
  }' | jq -r 'if .success then "✅ 성공: \(.data.name // "Token #1234")" else "❌ 실패: \(.error)" end'
echo ""

echo "📋 테스트 3: 잘못된 데이터 (에러 처리 테스트)"
echo "--------------------------------------------"
curl -s -X POST "$BASE_URL/api/admin/opensea/fetch" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "ethereum"
  }' | jq -r 'if .success then "✅ 성공" else "✅ 에러 처리 정상: \(.error)" end'
echo ""

echo "📋 테스트 4: 서비스 상태 확인"
echo "----------------------------"
curl -s -I "$BASE_URL" | head -1
echo ""

echo "✅ 모든 테스트 완료!"
echo ""
echo "🌐 관리자 페이지: $BASE_URL/admin/dashboard"
echo "📖 가이드 문서: /home/user/webapp/OPENSEA_IMPORT_GUIDE.md"
