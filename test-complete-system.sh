#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 전체 시스템 완벽 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_SUCCESS=0
TOTAL_FAIL=0

# 1. 라우트 테스트
echo "1️⃣  라우트 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash test-all-routes.sh > /tmp/route_test.log 2>&1
ROUTE_RESULT=$?
if [ $ROUTE_RESULT -eq 0 ]; then
  ROUTE_SUCCESS=$(grep "성공:" /tmp/route_test.log | awk '{print $3}')
  echo "   ✅ 라우트 테스트 통과 ($ROUTE_SUCCESS개)"
  TOTAL_SUCCESS=$((TOTAL_SUCCESS + ROUTE_SUCCESS))
else
  ROUTE_FAIL=$(grep "실패:" /tmp/route_test.log | awk '{print $3}')
  echo "   ❌ 라우트 테스트 실패 ($ROUTE_FAIL개)"
  TOTAL_FAIL=$((TOTAL_FAIL + ROUTE_FAIL))
fi
echo ""

# 2. 데이터베이스 스키마 테스트
echo "2️⃣  데이터베이스 스키마 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
bash test-database-schema.sh > /tmp/db_test.log 2>&1
DB_RESULT=$?
if [ $DB_RESULT -eq 0 ]; then
  echo "   ✅ 데이터베이스 스키마 정상"
  TOTAL_SUCCESS=$((TOTAL_SUCCESS + 7))
else
  DB_FAIL=$(grep "실패:" /tmp/db_test.log | awk '{print $3}' | cut -d'/' -f1)
  echo "   ❌ 데이터베이스 스키마 오류 ($DB_FAIL개)"
  TOTAL_FAIL=$((TOTAL_FAIL + DB_FAIL))
fi
echo ""

# 3. 회원가입 테스트 (샘플 3명)
echo "3️⃣  회원가입 기능 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 테스트용 신규 사용자 3명
TEST_USERS=(
  "test_general_$(date +%s)@test.com:general:Test1234!@#"
  "test_buyer_$(date +%s)@test.com:buyer:Test1234!@#"
  "test_artist_$(date +%s)@test.com:artist:Test1234!@#"
)

SIGNUP_SUCCESS=0
for USER_DATA in "${TEST_USERS[@]}"; do
  IFS=':' read -r EMAIL ROLE PASSWORD <<< "$USER_DATA"
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"username\":\"test_user_$(date +%s)\",\"full_name\":\"Test User\",\"password\":\"$PASSWORD\",\"role\":\"$ROLE\"}")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    ((SIGNUP_SUCCESS++))
  fi
done

if [ $SIGNUP_SUCCESS -eq 3 ]; then
  echo "   ✅ 회원가입 정상 작동 (3/3)"
  TOTAL_SUCCESS=$((TOTAL_SUCCESS + 3))
else
  echo "   ❌ 회원가입 일부 실패 ($SIGNUP_SUCCESS/3)"
  TOTAL_FAIL=$((TOTAL_FAIL + (3 - SIGNUP_SUCCESS)))
fi
echo ""

# 4. 로그인 테스트
echo "4️⃣  로그인 기능 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 기존 테스트 계정으로 로그인
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user01@gallerypia.com","password":"User1234!@#"}')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ 로그인 정상 작동"
  TOTAL_SUCCESS=$((TOTAL_SUCCESS + 1))
else
  echo "   ❌ 로그인 실패"
  TOTAL_FAIL=$((TOTAL_FAIL + 1))
fi
echo ""

# 5. UI 시스템 테스트 (간소화, 1회만)
echo "5️⃣  UI 시스템 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MAIN_PAGE=$(curl -s http://localhost:3000/)
TUTORIAL_COUNT=$(echo "$MAIN_PAGE" | grep '<script.*i18n-tutorial.js' | wc -l)
CHAT_COUNT=$(echo "$MAIN_PAGE" | grep -o "customer-support-ai.js\|realtime-chat.js" | wc -l)

UI_SUCCESS=0
if [ "$TUTORIAL_COUNT" -eq 1 ]; then
  echo "   ✅ 튜토리얼 정상"
  ((UI_SUCCESS++))
fi

if [ "$CHAT_COUNT" -ge 1 ]; then
  echo "   ✅ 채팅창 정상"
  ((UI_SUCCESS++))
fi

TOTAL_SUCCESS=$((TOTAL_SUCCESS + UI_SUCCESS))
TOTAL_FAIL=$((TOTAL_FAIL + (2 - UI_SUCCESS)))
echo ""

# 최종 결과
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 전체 시스템 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((TOTAL_SUCCESS + TOTAL_FAIL))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_SUCCESS / $TOTAL) * 100}")
ERROR_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_FAIL / $TOTAL) * 100}")

echo "✅ 성공: $TOTAL_SUCCESS / $TOTAL"
echo "❌ 실패: $TOTAL_FAIL / $TOTAL"
echo "📈 성공률: ${SUCCESS_RATE}%"
echo "📉 오류율: ${ERROR_RATE}%"
echo ""

if [ $TOTAL_FAIL -eq 0 ]; then
  echo "🎉 전체 시스템 완벽! 오류율 0%"
  exit 0
else
  echo "⚠️  일부 오류 발견. 자동 수정 권장!"
  exit 1
fi
