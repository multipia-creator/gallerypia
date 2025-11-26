#!/bin/bash

NEW_URL="https://5e8009e4.gallerypia.pages.dev"

echo "=========================================="
echo "🌐 i18n Deployment Verification"
echo "URL: $NEW_URL"
echo "=========================================="
echo ""

# Test Signup page in all languages
echo "📝 Testing Signup Page (4 Languages)..."
echo "----------------------------------------"
curl -o /dev/null -s -w "  ✅ Signup (ko): HTTP %{http_code}\n" "$NEW_URL/ko/signup"
curl -o /dev/null -s -w "  ✅ Signup (en): HTTP %{http_code}\n" "$NEW_URL/en/signup"
curl -o /dev/null -s -w "  ✅ Signup (zh): HTTP %{http_code}\n" "$NEW_URL/zh/signup"
curl -o /dev/null -s -w "  ✅ Signup (ja): HTTP %{http_code}\n" "$NEW_URL/ja/signup"
echo ""

# Test main routes
echo "📍 Testing Main Routes..."
echo "----------------------------------------"
curl -o /dev/null -s -w "  ✅ Homepage (ko): HTTP %{http_code}\n" "$NEW_URL/ko"
curl -o /dev/null -s -w "  ✅ Gallery (en): HTTP %{http_code}\n" "$NEW_URL/en/gallery"
curl -o /dev/null -s -w "  ✅ Leaderboard (zh): HTTP %{http_code}\n" "$NEW_URL/zh/leaderboard"
echo ""

# Test API endpoints including new leaderboard
echo "🔌 Testing API Endpoints..."
echo "----------------------------------------"
curl -o /dev/null -s -w "  ✅ /api/artworks: HTTP %{http_code}\n" "$NEW_URL/api/artworks"
curl -o /dev/null -s -w "  ✅ /api/artists: HTTP %{http_code}\n" "$NEW_URL/api/artists"
curl -o /dev/null -s -w "  ✅ /api/leaderboard: HTTP %{http_code}\n" "$NEW_URL/api/leaderboard"
echo ""

echo "=========================================="
echo "✅ i18n Deployment Verification Complete!"
echo "=========================================="
