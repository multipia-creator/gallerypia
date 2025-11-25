#!/bin/bash

echo "=== 🎨 Gallerypia API 통합 테스트 ==="
echo ""

echo "=== 1. GET /api/stats (통계 정보) ==="
curl -s http://localhost:3000/api/stats | jq '.'
echo ""

echo "=== 2. GET /api/artworks (작품 목록) ==="
ARTWORKS=$(curl -s http://localhost:3000/api/artworks)
echo "작품 개수: $(echo $ARTWORKS | jq '.data | length')"
echo ""

echo "=== 3. GET /api/artists (아티스트 목록) ==="
ARTISTS=$(curl -s http://localhost:3000/api/artists)
echo "아티스트 개수: $(echo $ARTISTS | jq '.data | length')"
echo ""

echo "=== 4. GET /api/collections (컬렉션 목록) ==="
COLLECTIONS=$(curl -s http://localhost:3000/api/collections)
echo "컬렉션 개수: $(echo $COLLECTIONS | jq '.data | length')"
echo ""

echo "=== 5. POST /api/auth/signup (회원가입 테스트) ==="
SIGNUP_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@gallerypia.com",
    "password":"Test1234!@#$",
    "username":"갤러리피아테스터",
    "role":"collector",
    "metamask_wallet":"0x1234567890abcdef1234567890abcdef12345678"
  }')

echo "$SIGNUP_RESULT" | jq '.'
echo ""

echo "=== 6. POST /api/auth/login (로그인 테스트) ==="
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@gallerypia.com",
    "password":"Test1234!@#$"
  }')

TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.token // .data.token // empty')
echo "로그인 성공: $(echo "$LOGIN_RESULT" | jq -r '.success')"
echo "토큰 (앞 50자): ${TOKEN:0:50}..."
echo ""

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "=== 7. GET /api/auth/me (JWT 인증 테스트) ==="
  curl -s http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  echo ""
else
  echo "⚠️ 로그인 실패로 JWT 테스트 생략"
  echo ""
fi

echo "=== 8. GET /api/artworks/featured/recommended (추천 작품) ==="
curl -s http://localhost:3000/api/artworks/featured/recommended | jq '.data | length'
echo ""

echo "=== 9. GET /api/artworks/featured/popular (인기 작품) ==="
curl -s http://localhost:3000/api/artworks/featured/popular | jq '.data | length'
echo ""

echo "=== 10. GET /api/artworks/featured/recent (최신 작품) ==="
curl -s http://localhost:3000/api/artworks/featured/recent | jq '.data | length'
echo ""

echo "=== ✅ 테스트 완료 ==="
