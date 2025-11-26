#!/bin/bash

BASE_URL="https://5e8009e4.gallerypia.pages.dev"
LANGS=("ko" "en" "zh" "ja")

# 전문가 검사를 위한 전체 라우트 목록 (확장)
ROUTES=(
  ""
  "signup"
  "login"
  "forgot-password"
  "gallery"
  "search"
  "recommendations"
  "leaderboard"
  "collections"
  "artists"
  "dashboard"
  "analytics"
  "transactions"
  "mypage"
  "about"
  "support"
  "help"
  "contact"
  "privacy"
  "academy"
  "valuation"
)

echo "=========================================="
echo "🔍 GalleryPia Expert Error Analysis"
echo "URL: $BASE_URL"
echo "Total Tests: $((${#LANGS[@]} * ${#ROUTES[@]}))"
echo "=========================================="
echo ""

SUCCESS=0
ERROR_500=0
ERROR_404=0
ERROR_302=0
OTHER_ERRORS=0
TOTAL=0

declare -a ERROR_ROUTES_500
declare -a ERROR_ROUTES_404
declare -a ERROR_ROUTES_302

for lang in "${LANGS[@]}"; do
  echo "🌐 Language: $lang"
  echo "----------------------------------------"
  
  for route in "${ROUTES[@]}"; do
    if [ -z "$route" ]; then
      URL="$BASE_URL/$lang"
      ROUTE_NAME="home"
    else
      URL="$BASE_URL/$lang/$route"
      ROUTE_NAME="$route"
    fi
    
    HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" -L "$URL")
    TOTAL=$((TOTAL + 1))
    
    if [ "$HTTP_CODE" = "200" ]; then
      echo "  ✅ /$lang/$ROUTE_NAME"
      SUCCESS=$((SUCCESS + 1))
    elif [ "$HTTP_CODE" = "500" ]; then
      echo "  ❌ /$lang/$ROUTE_NAME - HTTP $HTTP_CODE (SERVER ERROR)"
      ERROR_500=$((ERROR_500 + 1))
      ERROR_ROUTES_500+=("/$lang/$ROUTE_NAME")
    elif [ "$HTTP_CODE" = "404" ]; then
      echo "  ⚠️  /$lang/$ROUTE_NAME - HTTP $HTTP_CODE (NOT FOUND)"
      ERROR_404=$((ERROR_404 + 1))
      ERROR_ROUTES_404+=("/$lang/$ROUTE_NAME")
    elif [ "$HTTP_CODE" = "302" ]; then
      echo "  🔄 /$lang/$ROUTE_NAME - HTTP $HTTP_CODE (REDIRECT)"
      ERROR_302=$((ERROR_302 + 1))
      ERROR_ROUTES_302+=("/$lang/$ROUTE_NAME")
    else
      echo "  ⚠️  /$lang/$ROUTE_NAME - HTTP $HTTP_CODE"
      OTHER_ERRORS=$((OTHER_ERRORS + 1))
    fi
  done
  echo ""
done

echo "=========================================="
echo "📊 Expert Analysis Summary"
echo "=========================================="
echo "Total Routes Tested: $TOTAL"
echo "✅ Success (200): $SUCCESS ($(echo "scale=1; $SUCCESS * 100 / $TOTAL" | bc)%)"
echo "❌ Server Errors (500): $ERROR_500"
echo "⚠️  Not Found (404): $ERROR_404"
echo "🔄 Redirects (302): $ERROR_302"
echo "⚠️  Other Errors: $OTHER_ERRORS"
echo "=========================================="

if [ ${#ERROR_ROUTES_500[@]} -gt 0 ]; then
  echo ""
  echo "🚨 CRITICAL: HTTP 500 Errors Found"
  echo "----------------------------------------"
  for route in "${ERROR_ROUTES_500[@]}"; do
    echo "  - $route"
  done
fi

if [ ${#ERROR_ROUTES_404[@]} -gt 0 ]; then
  echo ""
  echo "⚠️  WARNING: HTTP 404 Errors Found"
  echo "----------------------------------------"
  for route in "${ERROR_ROUTES_404[@]}"; do
    echo "  - $route"
  done
fi

if [ ${#ERROR_ROUTES_302[@]} -gt 0 ]; then
  echo ""
  echo "ℹ️  INFO: Redirects (302) Found"
  echo "----------------------------------------"
  for route in "${ERROR_ROUTES_302[@]}"; do
    echo "  - $route"
  done
fi

echo ""
echo "=========================================="
if [ $ERROR_500 -gt 0 ]; then
  echo "Status: 🚨 CRITICAL - Production Issues"
  exit 1
elif [ $ERROR_404 -gt 0 ]; then
  echo "Status: ⚠️  WARNING - Some Routes Missing"
  exit 1
else
  echo "Status: ✅ EXCELLENT - All Routes Working"
  exit 0
fi
