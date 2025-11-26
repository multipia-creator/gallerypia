#!/bin/bash

BASE_URL="https://3626d161.gallerypia.pages.dev"
LANGS=("ko" "en" "zh" "ja")

# 검증할 라우트 목록
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
)

echo "=========================================="
echo "GalleryPia Production Verification"
echo "URL: $BASE_URL"
echo "=========================================="
echo ""

SUCCESS_COUNT=0
ERROR_500_COUNT=0
ERROR_404_COUNT=0
ERROR_302_COUNT=0
TOTAL_COUNT=0

for lang in "${LANGS[@]}"; do
  echo "🌐 Testing Language: $lang"
  echo "----------------------------------------"
  
  for route in "${ROUTES[@]}"; do
    if [ -z "$route" ]; then
      URL="$BASE_URL/$lang"
      ROUTE_NAME="home"
    else
      URL="$BASE_URL/$lang/$route"
      ROUTE_NAME="$route"
    fi
    
    HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" "$URL")
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    if [ "$HTTP_CODE" = "200" ]; then
      echo "  ✅ /$lang/$ROUTE_NAME - HTTP $HTTP_CODE"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    elif [ "$HTTP_CODE" = "500" ]; then
      echo "  ❌ /$lang/$ROUTE_NAME - HTTP $HTTP_CODE (SERVER ERROR)"
      ERROR_500_COUNT=$((ERROR_500_COUNT + 1))
    elif [ "$HTTP_CODE" = "404" ]; then
      echo "  ⚠️  /$lang/$ROUTE_NAME - HTTP $HTTP_CODE (NOT FOUND)"
      ERROR_404_COUNT=$((ERROR_404_COUNT + 1))
    elif [ "$HTTP_CODE" = "302" ]; then
      echo "  🔄 /$lang/$ROUTE_NAME - HTTP $HTTP_CODE (REDIRECT)"
      ERROR_302_COUNT=$((ERROR_302_COUNT + 1))
    else
      echo "  ⚠️  /$lang/$ROUTE_NAME - HTTP $HTTP_CODE"
    fi
  done
  
  echo ""
done

echo "=========================================="
echo "📊 Verification Summary"
echo "=========================================="
echo "Total Tests: $TOTAL_COUNT"
echo "✅ Success (200): $SUCCESS_COUNT"
echo "❌ Server Errors (500): $ERROR_500_COUNT"
echo "⚠️  Not Found (404): $ERROR_404_COUNT"
echo "🔄 Redirects (302): $ERROR_302_COUNT"
echo "=========================================="

if [ $ERROR_500_COUNT -gt 0 ]; then
  echo "⚠️  WARNING: Found $ERROR_500_COUNT server errors (HTTP 500)"
  exit 1
elif [ $ERROR_404_COUNT -gt 0 ]; then
  echo "⚠️  WARNING: Found $ERROR_404_COUNT not found errors (HTTP 404)"
  exit 1
else
  echo "✅ All routes verified successfully!"
  exit 0
fi
