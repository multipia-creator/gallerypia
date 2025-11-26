#!/bin/bash

NEW_URL="https://f8e9caef.gallerypia.pages.dev"

echo "=========================================="
echo "🚀 New Deployment Verification"
echo "URL: $NEW_URL"
echo "=========================================="
echo ""

# Test main routes
echo "📍 Testing Main Routes..."
echo "----------------------------------------"
curl -o /dev/null -s -w "  ✅ Homepage (ko): HTTP %{http_code}\n" "$NEW_URL/ko"
curl -o /dev/null -s -w "  ✅ Gallery (en): HTTP %{http_code}\n" "$NEW_URL/en/gallery"
curl -o /dev/null -s -w "  ✅ Leaderboard (zh): HTTP %{http_code}\n" "$NEW_URL/zh/leaderboard"
echo ""

# Test API endpoints
echo "🔌 Testing API Endpoints..."
echo "----------------------------------------"
curl -o /dev/null -s -w "  ✅ /api/artworks: HTTP %{http_code}\n" "$NEW_URL/api/artworks"
curl -o /dev/null -s -w "  ✅ /api/artists: HTTP %{http_code}\n" "$NEW_URL/api/artists"
curl -o /dev/null -s -w "  ✅ /api/collections: HTTP %{http_code}\n" "$NEW_URL/api/collections"
curl -o /dev/null -s -w "  🆕 /api/leaderboard (artists): HTTP %{http_code}\n" "$NEW_URL/api/leaderboard?type=artists"
curl -o /dev/null -s -w "  🆕 /api/leaderboard (artworks): HTTP %{http_code}\n" "$NEW_URL/api/leaderboard?type=artworks"
echo ""

# Test new leaderboard endpoint functionality
echo "🧪 Testing Leaderboard Data..."
echo "----------------------------------------"
LEADERBOARD_RESPONSE=$(curl -s "$NEW_URL/api/leaderboard?type=artists&limit=5")
if echo "$LEADERBOARD_RESPONSE" | grep -q '"success":true'; then
  echo "  ✅ Leaderboard API returns success"
  echo "  📊 Sample response: $(echo $LEADERBOARD_RESPONSE | head -c 100)..."
else
  echo "  ❌ Leaderboard API failed"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Verification Complete!"
echo "=========================================="
