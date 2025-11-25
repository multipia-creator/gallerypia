#!/bin/bash

echo "=== 1. GET /api/stats ==="
curl -s http://localhost:3000/api/stats | jq '.'

echo -e "\n=== 2. GET /api/artworks ==="
curl -s http://localhost:3000/api/artworks | jq '.data | length'

echo -e "\n=== 3. GET /api/artists ==="
curl -s http://localhost:3000/api/artists | jq '.data | length'

echo -e "\n=== 4. GET /api/categories ==="
curl -s http://localhost:3000/api/categories | jq '.'

echo -e "\n=== 5. GET /api/nfts ==="
curl -s http://localhost:3000/api/nfts | jq '.data | length'

echo -e "\n=== 6. POST /api/auth/register (테스트 유저 생성) ==="
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","username":"testuser","role":"collector"}' | jq '.'

echo -e "\n=== 7. POST /api/auth/login (테스트 유저 로그인) ==="
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}' | jq -r '.token')

echo "Token: ${TOKEN:0:50}..."

echo -e "\n=== 8. GET /api/profile (JWT 인증 테스트) ==="
curl -s http://localhost:3000/api/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n=== 테스트 완료 ==="
