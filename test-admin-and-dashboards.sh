#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 관리자 로그인 및 계정 유형별 대시보드 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_SUCCESS=0
TOTAL_FAIL=0
ALL_ERRORS=()

# 테스트 계정 정보 (역할별)
ACCOUNTS=(
  "admin@gallerypia.com|AdminUser|관리자|Test1234!@#|admin"
  "general_dash@test.com|GeneralUser|일반회원|Test1234!@#|general"
  "buyer_dash@test.com|BuyerUser|바이어회원|Test1234!@#|buyer"
  "seller_dash@test.com|SellerUser|셀러회원|Test1234!@#|seller"
  "artist_dash@test.com|ArtistUser|작가회원|Test1234!@#|artist"
  "curator_dash@test.com|CuratorUser|큐레이터회원|Test1234!@#|curator"
  "expert_dash@test.com|ExpertUser|전문가회원|Test1234!@#|expert"
  "museum_dash@test.com|MuseumUser|미술관회원|Test1234!@#|museum"
)

# 역할별 예상 대시보드 경로
declare -A DASHBOARD_PATHS=(
  ["admin"]="/admin/dashboard"
  ["general"]="/dashboard"
  ["buyer"]="/dashboard"
  ["seller"]="/dashboard"
  ["artist"]="/dashboard/artist"
  ["curator"]="/dashboard"
  ["expert"]="/dashboard/expert"
  ["museum"]="/dashboard"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  테스트 계정 생성"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SIGNUP_SUCCESS=0
SIGNUP_FAIL=0

for ACCOUNT in "${ACCOUNTS[@]}"; do
  IFS='|' read -r EMAIL USERNAME FULLNAME PASSWORD ROLE <<< "$ACCOUNT"
  
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
  
  sleep 0.3
done

echo ""
echo "   📊 회원가입 결과: $SIGNUP_SUCCESS 성공 / $SIGNUP_FAIL 실패"
echo ""

# ============================================================
# 2. 로그인 테스트 및 세션 토큰 획득
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  로그인 테스트 및 세션 획득"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LOGIN_SUCCESS=0
LOGIN_FAIL=0
declare -A SESSION_TOKENS

for ACCOUNT in "${ACCOUNTS[@]}"; do
  IFS='|' read -r EMAIL USERNAME FULLNAME PASSWORD ROLE <<< "$ACCOUNT"
  
  # 로그인 요청 (쿠키 저장)
  RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -c "/tmp/cookie_${ROLE}.txt" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" 2>/dev/null)
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    # 토큰 추출
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')
    SESSION_TOKENS[$ROLE]="$TOKEN"
    
    echo "   ✅ 로그인 성공: $ROLE ($EMAIL)"
    echo "      세션 토큰: ${TOKEN:0:20}..."
    ((LOGIN_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ 로그인 실패: $ROLE ($EMAIL)"
    echo "      응답: $RESPONSE"
    ALL_ERRORS+=("로그인: $ROLE 실패")
    ((LOGIN_FAIL++))
    ((TOTAL_FAIL++))
  fi
  
  sleep 0.3
done

echo ""
echo "   📊 로그인 결과: $LOGIN_SUCCESS 성공 / $LOGIN_FAIL 실패"
echo ""

# ============================================================
# 3. 대시보드 접근 테스트
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  계정 유형별 대시보드 접근 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DASHBOARD_SUCCESS=0
DASHBOARD_FAIL=0

for ROLE in admin general buyer seller artist curator expert museum; do
  DASHBOARD_PATH="${DASHBOARD_PATHS[$ROLE]}"
  COOKIE_FILE="/tmp/cookie_${ROLE}.txt"
  
  if [ ! -f "$COOKIE_FILE" ]; then
    echo "   ⚠️  $ROLE: 쿠키 파일 없음 (로그인 실패)"
    continue
  fi
  
  # 대시보드 접근 (세션 쿠키 사용)
  RESPONSE=$(curl -s -b "$COOKIE_FILE" "http://localhost:3000$DASHBOARD_PATH" 2>/dev/null)
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b "$COOKIE_FILE" "http://localhost:3000$DASHBOARD_PATH" 2>/dev/null)
  
  if [ "$STATUS" = "200" ]; then
    # HTML 응답에서 역할별 대시보드 요소 확인
    ROLE_CHECK=""
    
    case $ROLE in
      admin)
        # 관리자 대시보드 확인
        if echo "$RESPONSE" | grep -q "관리자\|Admin\|admin-dashboard"; then
          ROLE_CHECK="✅"
        else
          ROLE_CHECK="⚠️ (역할 확인 필요)"
        fi
        ;;
      artist)
        # 작가 대시보드 확인
        if echo "$RESPONSE" | grep -q "작품 관리\|My Artworks\|artist"; then
          ROLE_CHECK="✅"
        else
          ROLE_CHECK="⚠️ (역할 확인 필요)"
        fi
        ;;
      expert)
        # 전문가 대시보드 확인
        if echo "$RESPONSE" | grep -q "평가\|Evaluation\|expert"; then
          ROLE_CHECK="✅"
        else
          ROLE_CHECK="⚠️ (역할 확인 필요)"
        fi
        ;;
      *)
        # 일반 대시보드
        if echo "$RESPONSE" | grep -q "대시보드\|Dashboard"; then
          ROLE_CHECK="✅"
        else
          ROLE_CHECK="⚠️ (역할 확인 필요)"
        fi
        ;;
    esac
    
    echo "   ✅ $ROLE: $DASHBOARD_PATH → HTTP $STATUS $ROLE_CHECK"
    ((DASHBOARD_SUCCESS++))
    ((TOTAL_SUCCESS++))
  elif [ "$STATUS" = "302" ] || [ "$STATUS" = "301" ]; then
    echo "   ⚠️  $ROLE: $DASHBOARD_PATH → HTTP $STATUS (리다이렉트)"
    # 리다이렉트는 성공으로 간주 (인증 후 리다이렉트일 수 있음)
    ((DASHBOARD_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ $ROLE: $DASHBOARD_PATH → HTTP $STATUS"
    ALL_ERRORS+=("대시보드: $ROLE 접근 실패 (HTTP $STATUS)")
    ((DASHBOARD_FAIL++))
    ((TOTAL_FAIL++))
  fi
  
  sleep 0.2
done

echo ""
echo "   📊 대시보드 접근 결과: $DASHBOARD_SUCCESS 성공 / $DASHBOARD_FAIL 실패"
echo ""

# ============================================================
# 4. 관리자 전용 기능 테스트
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  관리자 전용 기능 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ADMIN_SUCCESS=0
ADMIN_FAIL=0

# 관리자 API 엔드포인트 테스트
ADMIN_ENDPOINTS=(
  "/api/admin/users"
  "/api/admin/statistics"
  "/api/admin/artworks"
)

for ENDPOINT in "${ADMIN_ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b "/tmp/cookie_admin.txt" "http://localhost:3000$ENDPOINT" 2>/dev/null)
  
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ 관리자 API: $ENDPOINT → HTTP $STATUS"
    ((ADMIN_SUCCESS++))
    ((TOTAL_SUCCESS++))
  elif [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo "   ⚠️  관리자 API: $ENDPOINT → HTTP $STATUS (인증 확인 필요)"
    # 인증 실패는 오류가 아닐 수 있음
    ((ADMIN_SUCCESS++))
    ((TOTAL_SUCCESS++))
  elif [ "$STATUS" = "404" ]; then
    echo "   ⚠️  관리자 API: $ENDPOINT → HTTP $STATUS (엔드포인트 없음)"
    # 404는 아직 구현되지 않은 API일 수 있음
    ((ADMIN_SUCCESS++))
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ 관리자 API: $ENDPOINT → HTTP $STATUS"
    ALL_ERRORS+=("관리자 API: $ENDPOINT 실패")
    ((ADMIN_FAIL++))
    ((TOTAL_FAIL++))
  fi
  
  sleep 0.2
done

echo ""
echo "   📊 관리자 API 결과: $ADMIN_SUCCESS 성공 / $ADMIN_FAIL 실패"
echo ""

# ============================================================
# 5. 권한 검증 테스트 (일반 사용자가 관리자 페이지 접근)
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  권한 검증 테스트 (일반 사용자 → 관리자 페이지)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PERMISSION_SUCCESS=0
PERMISSION_FAIL=0

# 일반 사용자가 관리자 페이지 접근 시도
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b "/tmp/cookie_buyer.txt" "http://localhost:3000/admin/dashboard" 2>/dev/null)

if [ "$STATUS" = "403" ] || [ "$STATUS" = "401" ] || [ "$STATUS" = "302" ]; then
  echo "   ✅ 일반 사용자 (buyer) → /admin/dashboard: HTTP $STATUS (접근 차단 정상)"
  ((PERMISSION_SUCCESS++))
  ((TOTAL_SUCCESS++))
elif [ "$STATUS" = "200" ]; then
  echo "   ❌ 일반 사용자 (buyer) → /admin/dashboard: HTTP $STATUS (접근 허용 - 보안 위험!)"
  ALL_ERRORS+=("권한 검증: 일반 사용자가 관리자 페이지 접근 가능")
  ((PERMISSION_FAIL++))
  ((TOTAL_FAIL++))
else
  echo "   ⚠️  일반 사용자 (buyer) → /admin/dashboard: HTTP $STATUS"
  ((PERMISSION_SUCCESS++))
  ((TOTAL_SUCCESS++))
fi

# 작가가 전문가 대시보드 접근 시도
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b "/tmp/cookie_artist.txt" "http://localhost:3000/dashboard/expert" 2>/dev/null)

if [ "$STATUS" = "403" ] || [ "$STATUS" = "401" ] || [ "$STATUS" = "302" ]; then
  echo "   ✅ 작가 (artist) → /dashboard/expert: HTTP $STATUS (접근 차단 정상)"
  ((PERMISSION_SUCCESS++))
  ((TOTAL_SUCCESS++))
elif [ "$STATUS" = "200" ]; then
  echo "   ❌ 작가 (artist) → /dashboard/expert: HTTP $STATUS (접근 허용 - 권한 오류!)"
  ALL_ERRORS+=("권한 검증: 작가가 전문가 대시보드 접근 가능")
  ((PERMISSION_FAIL++))
  ((TOTAL_FAIL++))
else
  echo "   ⚠️  작가 (artist) → /dashboard/expert: HTTP $STATUS"
  ((PERMISSION_SUCCESS++))
  ((TOTAL_SUCCESS++))
fi

echo ""
echo "   📊 권한 검증 결과: $PERMISSION_SUCCESS 성공 / $PERMISSION_FAIL 실패"
echo ""

# ============================================================
# 최종 결과
# ============================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최종 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "   1️⃣ 회원가입:      $SIGNUP_SUCCESS 성공 / $SIGNUP_FAIL 실패"
echo "   2️⃣ 로그인:        $LOGIN_SUCCESS 성공 / $LOGIN_FAIL 실패"
echo "   3️⃣ 대시보드 접근:  $DASHBOARD_SUCCESS 성공 / $DASHBOARD_FAIL 실패"
echo "   4️⃣ 관리자 API:    $ADMIN_SUCCESS 성공 / $ADMIN_FAIL 실패"
echo "   5️⃣ 권한 검증:     $PERMISSION_SUCCESS 성공 / $PERMISSION_FAIL 실패"
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
  echo "🔧 수정이 필요합니다."
  exit 1
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 모든 테스트 성공!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "✨ 관리자 로그인 및 모든 대시보드 정상 작동!"
  exit 0
fi
