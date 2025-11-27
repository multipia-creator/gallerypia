#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 완벽한 로그인 테스트 (15명 + 에러 케이스)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS=0
FAIL=0

# 15명의 정상 로그인 테스트
USERS=(
  "user01@gallerypia.com:User1234!@#:general"
  "user02@gallerypia.com:User1234!@#:general"
  "buyer01@gallerypia.com:Buyer1234!@#:buyer"
  "buyer02@gallerypia.com:Buyer1234!@#:buyer"
  "seller01@gallerypia.com:Seller1234!@#:seller"
  "seller02@gallerypia.com:Seller1234!@#:seller"
  "artist01@gallerypia.com:Artist1234!@#:artist"
  "artist02@gallerypia.com:Artist1234!@#:artist"
  "artist03@gallerypia.com:Artist1234!@#:artist"
  "curator01@gallerypia.com:Curator1234!@#:curator"
  "curator02@gallerypia.com:Curator1234!@#:curator"
  "expert01@gallerypia.com:Expert1234!@#:expert"
  "expert02@gallerypia.com:Expert1234!@#:expert"
  "museum01@gallerypia.com:Museum1234!@#:museum"
  "museum02@gallerypia.com:Museum1234!@#:museum"
)

COUNT=0
TOTAL=${#USERS[@]}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 1: 정상 로그인 테스트 (15명)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for USER_DATA in "${USERS[@]}"; do
  ((COUNT++))
  IFS=':' read -r EMAIL PASSWORD EXPECTED_ROLE <<< "$USER_DATA"
  
  echo "🔑 테스트 [$COUNT/$TOTAL]: $EXPECTED_ROLE 계정 로그인"
  echo "   이메일: $EMAIL"
  
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  
  SUCCESS_CHECK=$(echo "$RESPONSE" | grep -o '"success":true' || true)
  
  if [ -n "$SUCCESS_CHECK" ]; then
    ACTUAL_ROLE=$(echo "$RESPONSE" | grep -o '"role":"[^"]*"' | sed 's/"role":"//;s/"$//' || echo "N/A")
    SESSION_TOKEN=$(echo "$RESPONSE" | grep -o '"session_token":"[^"]*"' | sed 's/"session_token":"//;s/"$//' | head -c 20 || echo "N/A")
    
    if [ "$ACTUAL_ROLE" == "$EXPECTED_ROLE" ]; then
      echo "   ✅ 성공 (역할: $ACTUAL_ROLE, 토큰: ${SESSION_TOKEN}...)"
      ((SUCCESS++))
    else
      echo "   ⚠️  로그인 성공했으나 역할 불일치 (예상: $EXPECTED_ROLE, 실제: $ACTUAL_ROLE)"
      ((FAIL++))
    fi
  else
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//' || echo "알 수 없는 오류")
    echo "   ❌ 실패: $ERROR_MSG"
    ((FAIL++))
  fi
  
  echo ""
  sleep 3  # Rate limit 방지
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PART 2: 에러 케이스 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 에러 케이스 1: 잘못된 비밀번호
echo "🚫 테스트: 잘못된 비밀번호"
echo "   이메일: user01@gallerypia.com"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user01@gallerypia.com\",\"password\":\"WrongPassword123!@#\"}")

FAIL_CHECK=$(echo "$RESPONSE" | grep -o '"success":false' || true)
if [ -n "$FAIL_CHECK" ]; then
  ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//' || echo "N/A")
  echo "   ✅ 정상적으로 거부됨 (에러: $ERROR_MSG)"
  ((SUCCESS++))
else
  echo "   ❌ 실패: 잘못된 비밀번호를 허용함"
  ((FAIL++))
fi
echo ""

# 에러 케이스 2: 존재하지 않는 계정
echo "❓ 테스트: 존재하지 않는 계정"
echo "   이메일: nonexistent_user@gallerypia.com"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"nonexistent_user@gallerypia.com\",\"password\":\"Test1234!@#\"}")

FAIL_CHECK=$(echo "$RESPONSE" | grep -o '"success":false' || true)
if [ -n "$FAIL_CHECK" ]; then
  ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//' || echo "N/A")
  echo "   ✅ 정상적으로 거부됨 (에러: $ERROR_MSG)"
  ((SUCCESS++))
else
  echo "   ❌ 실패: 존재하지 않는 계정 허용함"
  ((FAIL++))
fi
echo ""

# 에러 케이스 3: 빈 이메일
echo "⚠️  테스트: 빈 이메일"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"\",\"password\":\"Test1234!@#\"}")

FAIL_CHECK=$(echo "$RESPONSE" | grep -o '"success":false' || true)
if [ -n "$FAIL_CHECK" ]; then
  ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//' || echo "N/A")
  echo "   ✅ 정상적으로 거부됨 (에러: $ERROR_MSG)"
  ((SUCCESS++))
else
  echo "   ❌ 실패: 빈 이메일 허용함"
  ((FAIL++))
fi
echo ""

# 에러 케이스 4: 빈 비밀번호
echo "⚠️  테스트: 빈 비밀번호"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user01@gallerypia.com\",\"password\":\"\"}")

FAIL_CHECK=$(echo "$RESPONSE" | grep -o '"success":false' || true)
if [ -n "$FAIL_CHECK" ]; then
  ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//' || echo "N/A")
  echo "   ✅ 정상적으로 거부됨 (에러: $ERROR_MSG)"
  ((SUCCESS++))
else
  echo "   ❌ 실패: 빈 비밀번호 허용함"
  ((FAIL++))
fi
echo ""

TOTAL=$((15 + 4))  # 15명 정상 로그인 + 4개 에러 케이스

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최종 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 성공: $SUCCESS / $TOTAL"
echo "❌ 실패: $FAIL / $TOTAL"

SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($SUCCESS / $TOTAL) * 100}")
echo "📈 성공률: ${SUCCESS_RATE}%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 모든 테스트 통과! 오류율 0%"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo "⚠️  일부 테스트 실패. 즉시 수정 필요!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
