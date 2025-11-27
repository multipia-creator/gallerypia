#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 대시보드 상세 기능 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 테스트할 계정
TEST_ACCOUNTS=(
  "admin@gallerypia.com|Test1234!@#|admin|/admin/dashboard"
  "artist_dash@test.com|Test1234!@#|artist|/dashboard/artist"
  "expert_dash@test.com|Test1234!@#|expert|/dashboard/expert"
  "buyer_dash@test.com|Test1234!@#|buyer|/dashboard"
)

TOTAL_SUCCESS=0
TOTAL_FAIL=0

for ACCOUNT in "${TEST_ACCOUNTS[@]}"; do
  IFS='|' read -r EMAIL PASSWORD ROLE DASHBOARD <<< "$ACCOUNT"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔐 $ROLE 계정 테스트: $EMAIL"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # 1. 로그인
  echo "1️⃣  로그인 시도..."
  LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" 2>/dev/null)
  
  if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')
    USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
    
    echo "   ✅ 로그인 성공"
    echo "   👤 User ID: $USER_ID"
    echo "   🔑 Token: ${TOKEN:0:30}..."
    ((TOTAL_SUCCESS++))
  else
    echo "   ❌ 로그인 실패"
    echo "   응답: $LOGIN_RESPONSE"
    ((TOTAL_FAIL++))
    continue
  fi
  
  echo ""
  
  # 2. 대시보드 접근 (Bearer 토큰)
  echo "2️⃣  대시보드 접근: $DASHBOARD"
  DASHBOARD_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000$DASHBOARD" 2>/dev/null)
  DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "http://localhost:3000$DASHBOARD" 2>/dev/null)
  
  echo "   HTTP Status: $DASHBOARD_STATUS"
  
  if [ "$DASHBOARD_STATUS" = "200" ]; then
    # HTML 제목 추출
    TITLE=$(echo "$DASHBOARD_RESPONSE" | grep -o "<title>[^<]*</title>" | sed 's/<title>//;s/<\/title>//')
    echo "   📄 페이지 제목: $TITLE"
    
    # 역할별 핵심 요소 확인
    case $ROLE in
      admin)
        if echo "$DASHBOARD_RESPONSE" | grep -q "관리자 대시보드\|Admin Dashboard\|admin-dashboard"; then
          echo "   ✅ 관리자 대시보드 확인됨"
          ((TOTAL_SUCCESS++))
        else
          echo "   ⚠️  관리자 대시보드 요소 미확인"
          ((TOTAL_FAIL++))
        fi
        
        # 통계 정보 확인
        if echo "$DASHBOARD_RESPONSE" | grep -q "전체 사용자\|Total Users\|사용자 수"; then
          echo "   ✅ 사용자 통계 존재"
          ((TOTAL_SUCCESS++))
        else
          echo "   ⚠️  사용자 통계 없음"
        fi
        ;;
        
      artist)
        if echo "$DASHBOARD_RESPONSE" | grep -q "작품 관리\|My Artworks\|artist.*dashboard"; then
          echo "   ✅ 작가 대시보드 확인됨"
          ((TOTAL_SUCCESS++))
        else
          echo "   ⚠️  작가 대시보드 요소 미확인"
          ((TOTAL_FAIL++))
        fi
        
        # 작품 등록 버튼 확인
        if echo "$DASHBOARD_RESPONSE" | grep -q "작품 등록\|Upload Artwork\|새 작품"; then
          echo "   ✅ 작품 등록 기능 존재"
          ((TOTAL_SUCCESS++))
        else
          echo "   ⚠️  작품 등록 버튼 없음"
        fi
        ;;
        
      expert)
        if echo "$DASHBOARD_RESPONSE" | grep -q "평가\|Evaluation\|감정\|Appraisal"; then
          echo "   ✅ 전문가 대시보드 확인됨"
          ((TOTAL_SUCCESS++))
        else
          echo "   ⚠️  전문가 대시보드 요소 미확인"
          ((TOTAL_FAIL++))
        fi
        
        # 평가 목록 확인
        if echo "$DASHBOARD_RESPONSE" | grep -q "평가 목록\|Evaluation List\|평가 요청"; then
          echo "   ✅ 평가 목록 존재"
          ((TOTAL_SUCCESS++))
        else
          echo "   ⚠️  평가 목록 없음"
        fi
        ;;
        
      buyer)
        if echo "$DASHBOARD_RESPONSE" | grep -q "대시보드\|Dashboard\|마이페이지"; then
          echo "   ✅ 바이어 대시보드 확인됨"
          ((TOTAL_SUCCESS++))
        else
          echo "   ⚠️  바이어 대시보드 요소 미확인"
          ((TOTAL_FAIL++))
        fi
        ;;
    esac
    
  elif [ "$DASHBOARD_STATUS" = "302" ] || [ "$DASHBOARD_STATUS" = "301" ]; then
    echo "   ⚠️  리다이렉트됨 (인증 실패 가능)"
    
    # 리다이렉트 위치 확인
    REDIRECT_LOCATION=$(curl -s -I -H "Authorization: Bearer $TOKEN" "http://localhost:3000$DASHBOARD" 2>/dev/null | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')
    if [ -n "$REDIRECT_LOCATION" ]; then
      echo "   📍 리다이렉트 위치: $REDIRECT_LOCATION"
    fi
    
    ((TOTAL_FAIL++))
  else
    echo "   ❌ 대시보드 접근 실패 (HTTP $DASHBOARD_STATUS)"
    ((TOTAL_FAIL++))
  fi
  
  echo ""
  
  # 3. 대시보드 쿠키 방식 재시도
  if [ "$DASHBOARD_STATUS" != "200" ]; then
    echo "3️⃣  쿠키 방식으로 재시도..."
    
    # 로그인 후 쿠키 저장
    curl -s -X POST "http://localhost:3000/api/auth/login" \
      -H "Content-Type: application/json" \
      -c "/tmp/cookie_${ROLE}_test.txt" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" > /dev/null 2>&1
    
    # 쿠키로 대시보드 접근
    COOKIE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b "/tmp/cookie_${ROLE}_test.txt" "http://localhost:3000$DASHBOARD" 2>/dev/null)
    
    echo "   HTTP Status (쿠키): $COOKIE_STATUS"
    
    if [ "$COOKIE_STATUS" = "200" ]; then
      echo "   ✅ 쿠키 방식 성공"
      ((TOTAL_SUCCESS++))
    else
      echo "   ❌ 쿠키 방식도 실패 (HTTP $COOKIE_STATUS)"
      ((TOTAL_FAIL++))
    fi
    
    echo ""
  fi
  
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최종 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   ✅ 성공: $TOTAL_SUCCESS"
echo "   ❌ 실패: $TOTAL_FAIL"
echo ""

if [ $TOTAL_FAIL -eq 0 ]; then
  echo "🎉 모든 대시보드 테스트 성공!"
  exit 0
else
  echo "⚠️  일부 테스트 실패"
  exit 1
fi
