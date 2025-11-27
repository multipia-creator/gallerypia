#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 전체 사이트 라우트 검사"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS=0
FAIL=0
ERRORS=()

# 주요 페이지 라우트
PAGES=(
  "/:메인페이지"
  "/login:로그인"
  "/signup:회원가입"
  "/artworks:작품목록"
  "/artists:작가목록"
  "/about:소개"
  "/contact:문의"
  "/pricing:가격정책"
  "/faq:FAQ"
  "/privacy:개인정보처리방침"
  "/terms:이용약관"
)

# API 엔드포인트
APIS=(
  "/api/auth/login:POST:로그인API"
  "/api/auth/register:POST:회원가입API"
  "/api/artworks:GET:작품목록API"
  "/api/artists:GET:작가목록API"
)

echo "📄 페이지 라우트 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for ROUTE_DATA in "${PAGES[@]}"; do
  IFS=':' read -r ROUTE NAME <<< "$ROUTE_DATA"
  
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${ROUTE}")
  
  # 200 OK 또는 302 Redirect (정상적인 리다이렉트)를 성공으로 처리
  if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 302 ]; then
    echo "   ✅ $NAME ($ROUTE) - HTTP $HTTP_STATUS"
    ((SUCCESS++))
  else
    echo "   ❌ $NAME ($ROUTE) - HTTP $HTTP_STATUS"
    ERRORS+=("$NAME ($ROUTE): HTTP $HTTP_STATUS")
    ((FAIL++))
  fi
done

echo ""
echo "📡 API 엔드포인트 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# GET APIs
for ROUTE_DATA in "${APIS[@]}"; do
  IFS=':' read -r ROUTE METHOD NAME <<< "$ROUTE_DATA"
  
  if [ "$METHOD" == "GET" ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${ROUTE}")
    
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 401 ]; then
      echo "   ✅ $NAME ($ROUTE) - HTTP $HTTP_STATUS"
      ((SUCCESS++))
    else
      echo "   ❌ $NAME ($ROUTE) - HTTP $HTTP_STATUS"
      ERRORS+=("$NAME ($ROUTE): HTTP $HTTP_STATUS")
      ((FAIL++))
    fi
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 성공: $SUCCESS"
echo "❌ 실패: $FAIL"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "⚠️  발견된 오류:"
  for ERROR in "${ERRORS[@]}"; do
    echo "   - $ERROR"
  done
fi

echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 모든 라우트 정상 작동!"
  exit 0
else
  echo "⚠️  일부 라우트 오류 발견. 수정 필요!"
  exit 1
fi
