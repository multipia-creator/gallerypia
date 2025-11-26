#!/bin/bash

BASE_URL="https://3626d161.gallerypia.pages.dev"

echo "=========================================="
echo "API Endpoint Verification"
echo "=========================================="
echo ""

# Test API endpoints
API_ENDPOINTS=(
  "/api/artworks"
  "/api/artists"
  "/api/collections"
  "/api/leaderboard"
)

SUCCESS=0
FAILED=0

for endpoint in "${API_ENDPOINTS[@]}"; do
  URL="$BASE_URL$endpoint"
  HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" "$URL")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ $endpoint - HTTP $HTTP_CODE"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "❌ $endpoint - HTTP $HTTP_CODE"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=========================================="
echo "API Summary: $SUCCESS success, $FAILED failed"
echo "=========================================="
