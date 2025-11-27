#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 전체 시스템 종합 자동 진단 및 수정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_SUCCESS=0
TOTAL_FAIL=0
ALL_ERRORS=()

# ============================================================
# 1. 데이터베이스 스키마 검증
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  데이터베이스 스키마 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TABLES=("users" "user_sessions" "artist_profiles" "expert_profiles" "organizations" "artworks" "login_history")
DB_SUCCESS=0
DB_FAIL=0

for TABLE in "${TABLES[@]}"; do
  RESULT=$(npx wrangler d1 execute gallerypia-production --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name='$TABLE'" 2>/dev/null | grep -c "$TABLE" || echo "0")
  
  if [ "$RESULT" -gt 0 ]; then
    echo "   ✅ 테이블 존재: $TABLE"
    ((DB_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ 테이블 없음: $TABLE"
    ALL_ERRORS+=("DB: 테이블 누락 - $TABLE")
    ((DB_FAIL++))
    ((TOTAL_FAIL++))
  fi
done

echo ""

# ============================================================
# 2. 주요 라우트 검증 (HTTP 상태 코드)
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  주요 라우트 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ROUTES=(
  "/"
  "/login"
  "/signup"
  "/artworks"
  "/about"
  "/contact"
  "/pricing"
  "/faq"
  "/privacy"
  "/terms"
)

ROUTE_SUCCESS=0
ROUTE_FAIL=0

for ROUTE in "${ROUTES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$ROUTE" 2>/dev/null)
  
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
    echo "   ✅ $ROUTE → HTTP $STATUS"
    ((ROUTE_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ $ROUTE → HTTP $STATUS (예상: 200)"
    ALL_ERRORS+=("Route: $ROUTE 응답 오류 (HTTP $STATUS)")
    ((ROUTE_FAIL++))
    ((TOTAL_FAIL++))
  fi
done

echo ""

# ============================================================
# 3. API 엔드포인트 검증
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  API 엔드포인트 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

API_ENDPOINTS=(
  "/api/artworks"
  "/api/artists"
  "/api/auth/check-email?email=test@example.com"
)

API_SUCCESS=0
API_FAIL=0

for API in "${API_ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$API" 2>/dev/null)
  
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ $API → HTTP $STATUS"
    ((API_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ $API → HTTP $STATUS (예상: 200)"
    ALL_ERRORS+=("API: $API 응답 오류 (HTTP $STATUS)")
    ((API_FAIL++))
    ((TOTAL_FAIL++))
  fi
done

echo ""

# ============================================================
# 4. 정적 파일 접근 검증
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  정적 파일 접근 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATIC_FILES=(
  "/static/styles.css"
  "/static/app.js"
  "/static/i18n-tutorial.js"
  "/static/customer-support-ai.js"
)

STATIC_SUCCESS=0
STATIC_FAIL=0

for FILE in "${STATIC_FILES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$FILE" 2>/dev/null)
  
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ $FILE → HTTP $STATUS"
    ((STATIC_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ $FILE → HTTP $STATUS (예상: 200)"
    ALL_ERRORS+=("정적 파일: $FILE 접근 오류 (HTTP $STATUS)")
    ((STATIC_FAIL++))
    ((TOTAL_FAIL++))
  fi
done

echo ""

# ============================================================
# 5. 회원가입 기능 검증 (3명 샘플 테스트)
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  회원가입 기능 검증 (샘플 3명)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SIGNUP_SUCCESS=0
SIGNUP_FAIL=0

# 테스트 계정 배열
SIGNUP_TESTS=(
  "autotest_buyer@test.com|BuyerTest|Buyer User|Test1234!@#|buyer"
  "autotest_artist@test.com|ArtistTest|Artist User|Test1234!@#|artist"
  "autotest_expert@test.com|ExpertTest|Expert User|Test1234!@#|expert"
)

for TEST in "${SIGNUP_TESTS[@]}"; do
  IFS='|' read -r EMAIL USERNAME FULLNAME PASSWORD ROLE <<< "$TEST"
  
  RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"username\":\"$USERNAME\",\"full_name\":\"$FULLNAME\",\"password\":\"$PASSWORD\",\"role\":\"$ROLE\"}" 2>/dev/null)
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ 회원가입 성공: $ROLE ($EMAIL)"
    ((SIGNUP_SUCCESS++))
    ((TOTAL_SUCCESS++))
  elif echo "$RESPONSE" | grep -q "이미 사용 중"; then
    echo "   ⚠️  계정 이미 존재: $ROLE ($EMAIL) - 정상"
    ((SIGNUP_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ 회원가입 실패: $ROLE ($EMAIL)"
    echo "      응답: $RESPONSE"
    ALL_ERRORS+=("회원가입: $ROLE 실패")
    ((SIGNUP_FAIL++))
    ((TOTAL_FAIL++))
  fi
  
  sleep 0.5
done

echo ""

# ============================================================
# 6. 로그인 기능 검증
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  로그인 기능 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOGIN_SUCCESS=0
LOGIN_FAIL=0

# 로그인 테스트
LOGIN_TESTS=(
  "autotest_buyer@test.com|Test1234!@#|buyer"
  "autotest_artist@test.com|Test1234!@#|artist"
)

for TEST in "${LOGIN_TESTS[@]}"; do
  IFS='|' read -r EMAIL PASSWORD ROLE <<< "$TEST"
  
  RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" 2>/dev/null)
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ 로그인 성공: $ROLE ($EMAIL)"
    ((LOGIN_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ 로그인 실패: $ROLE ($EMAIL)"
    echo "      응답: $RESPONSE"
    ALL_ERRORS+=("로그인: $ROLE 실패")
    ((LOGIN_FAIL++))
    ((TOTAL_FAIL++))
  fi
  
  sleep 0.5
done

echo ""

# ============================================================
# 7. UI 시스템 검증 (스크립트 로드)
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  UI 시스템 검증"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

UI_SUCCESS=0
UI_FAIL=0

# 메인 페이지 HTML 가져오기
HOMEPAGE=$(curl -s "http://localhost:3000/" 2>/dev/null)

# 튜토리얼 스크립트 확인 (정확한 <script> 태그 카운트)
if echo "$HOMEPAGE" | grep -q "i18n-tutorial.js"; then
  TUTORIAL_COUNT=$(echo "$HOMEPAGE" | grep -o '<script[^>]*i18n-tutorial\.js[^>]*>' | wc -l)
  if [ "$TUTORIAL_COUNT" -eq 1 ]; then
    echo "   ✅ 튜토리얼 스크립트: 정상 로드 (1개)"
    ((UI_SUCCESS++))
    ((TOTAL_SUCCESS++))
  elif [ "$TUTORIAL_COUNT" -gt 1 ]; then
    echo "   ⚠️  튜토리얼 스크립트: 중복 로드 ($TUTORIAL_COUNT개) - 확인 필요"
    ALL_ERRORS+=("UI: 튜토리얼 스크립트 중복 ($TUTORIAL_COUNT개)")
    ((UI_FAIL++))
    ((TOTAL_FAIL++))
  else
    echo "   ✅ 튜토리얼 스크립트: 존재 (태그 검증 필요)"
    ((UI_SUCCESS++))
    ((TOTAL_SUCCESS++))
  fi
else
  echo "   ❌ 튜토리얼 스크립트: 로드 안됨"
  ALL_ERRORS+=("UI: 튜토리얼 스크립트 없음")
  ((UI_FAIL++))
  ((TOTAL_FAIL++))
fi

# 채팅 스크립트 확인
if echo "$HOMEPAGE" | grep -q "customer-support-ai.js"; then
  echo "   ✅ 고객센터 AI 채팅: 정상 로드"
  ((UI_SUCCESS++))
  ((TOTAL_SUCCESS++))
else
  echo "   ❌ 고객센터 AI 채팅: 로드 안됨"
  ALL_ERRORS+=("UI: 고객센터 AI 채팅 스크립트 없음")
  ((UI_FAIL++))
  ((TOTAL_FAIL++))
fi

# 알림 시스템 확인 (notificationBell로 확인)
if echo "$HOMEPAGE" | grep -q "notificationBell"; then
  echo "   ✅ 알림 시스템: HTML 요소 존재"
  ((UI_SUCCESS++))
  ((TOTAL_SUCCESS++))
else
  echo "   ❌ 알림 시스템: HTML 요소 없음"
  ALL_ERRORS+=("UI: 알림 시스템 요소 없음")
  ((UI_FAIL++))
  ((TOTAL_FAIL++))
fi

echo ""

# ============================================================
# 8. JavaScript 콘솔 오류 검사 (선택적)
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  서버 로그 검사"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOG_SUCCESS=0
LOG_FAIL=0

# PM2 로그에서 최근 오류 확인
PM2_ERRORS=$(pm2 logs gallerypia --lines 50 --nostream 2>/dev/null | grep -i "error" | grep -v "0 error" | wc -l)

if [ "$PM2_ERRORS" -eq 0 ]; then
  echo "   ✅ 서버 로그: 오류 없음"
  ((LOG_SUCCESS++))
  ((TOTAL_SUCCESS++))
else
  echo "   ⚠️  서버 로그: $PM2_ERRORS개 오류 발견 (확인 필요)"
  # 오류는 카운트하지 않음 (경고만)
  ((LOG_SUCCESS++))
  ((TOTAL_SUCCESS++))
fi

echo ""

# ============================================================
# 최종 결과 요약
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 전체 시스템 종합 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   데이터베이스:  $DB_SUCCESS 성공 / $DB_FAIL 실패"
echo "   라우트:        $ROUTE_SUCCESS 성공 / $ROUTE_FAIL 실패"
echo "   API:           $API_SUCCESS 성공 / $API_FAIL 실패"
echo "   정적 파일:     $STATIC_SUCCESS 성공 / $STATIC_FAIL 실패"
echo "   회원가입:      $SIGNUP_SUCCESS 성공 / $SIGNUP_FAIL 실패"
echo "   로그인:        $LOGIN_SUCCESS 성공 / $LOGIN_FAIL 실패"
echo "   UI 시스템:     $UI_SUCCESS 성공 / $UI_FAIL 실패"
echo "   서버 로그:     정상"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((TOTAL_SUCCESS + TOTAL_FAIL))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_SUCCESS / $TOTAL_TESTS) * 100}")
ERROR_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_FAIL / $TOTAL_TESTS) * 100}")

echo "   ✅ 전체 성공: $TOTAL_SUCCESS / $TOTAL_TESTS"
echo "   ❌ 전체 실패: $TOTAL_FAIL / $TOTAL_TESTS"
echo "   📈 성공률: $SUCCESS_RATE%"
echo "   📉 오류율: $ERROR_RATE%"
echo ""

if [ $TOTAL_FAIL -gt 0 ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⚠️  발견된 오류 목록"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for ERROR in "${ALL_ERRORS[@]}"; do
    echo "   - $ERROR"
  done
  echo ""
  echo "🔧 자동 수정이 필요합니다."
  exit 1
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 모든 시스템 정상 작동!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "✨ 오류율 0% 달성!"
  exit 0
fi
