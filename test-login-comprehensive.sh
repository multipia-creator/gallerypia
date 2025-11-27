#!/bin/bash

echo "🔐 로그인 전체 테스트 시작..."
echo ""

SUCCESS=0
FAIL=0

# Test users created from signup test
USERS=(
  "general_test@gallerypia.com:Test1234!@#:general"
  "buyer_test@gallerypia.com:Test1234!@#:buyer"
  "seller_test@gallerypia.com:Test1234!@#:seller"
  "artist_test@gallerypia.com:Test1234!@#:artist"
  "curator_test@gallerypia.com:Test1234!@#:curator"
)

for USER_DATA in "${USERS[@]}"; do
  IFS=':' read -r EMAIL PASSWORD ROLE <<< "$USER_DATA"
  
  echo "🔑 테스트: $ROLE 계정 로그인"
  echo "   이메일: $EMAIL"
  
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  
  SUCCESS_CHECK=$(echo "$RESPONSE" | grep -o '"success":true' || true)
  
  if [ -n "$SUCCESS_CHECK" ]; then
    echo "   ✅ 성공"
    ((SUCCESS++))
  else
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//' || echo "알 수 없는 오류")
    echo "   ❌ 실패: $ERROR_MSG"
    ((FAIL++))
  fi
  echo ""
  sleep 2  # Rate limit 방지
done

# Test wrong password
echo "🚫 테스트: 잘못된 비밀번호"
echo "   이메일: general_test@gallerypia.com"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"general_test@gallerypia.com\",\"password\":\"WrongPassword123\"}")

FAIL_CHECK=$(echo "$RESPONSE" | grep -o '"success":false' || true)
if [ -n "$FAIL_CHECK" ]; then
  echo "   ✅ 성공 (정상적으로 거부됨)"
  ((SUCCESS++))
else
  echo "   ❌ 실패 (잘못된 비밀번호를 허용함)"
  ((FAIL++))
fi
echo ""

# Test non-existent user
echo "❓ 테스트: 존재하지 않는 계정"
echo "   이메일: nonexistent@gallerypia.com"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"nonexistent@gallerypia.com\",\"password\":\"Test1234!@#\"}")

FAIL_CHECK=$(echo "$RESPONSE" | grep -o '"success":false' || true)
if [ -n "$FAIL_CHECK" ]; then
  echo "   ✅ 성공 (정상적으로 거부됨)"
  ((SUCCESS++))
else
  echo "   ❌ 실패 (존재하지 않는 계정 허용함)"
  ((FAIL++))
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 성공: $SUCCESS / $((SUCCESS + FAIL))"
echo "❌ 실패: $FAIL / $((SUCCESS + FAIL))"

TOTAL=$((SUCCESS + FAIL))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.0f\", ($SUCCESS / $TOTAL) * 100}")
echo "📈 성공률: ${SUCCESS_RATE}%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 모든 테스트 통과! 오류율 0%"
  exit 0
else
  echo "⚠️  일부 테스트 실패. 수정 필요"
  exit 1
fi
