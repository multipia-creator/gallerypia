#!/bin/bash
# GalleryPia Page Validation Script
# Target: 0% Error Rate - World-Class Quality

echo "===================================="
echo "GalleryPia Page Validation Test"
echo "Target: 0% Error Rate"
echo "===================================="
echo ""

BASE_URL="https://e4019c6d.gallerypia.pages.dev"
ERRORS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_page() {
    local page_name=$1
    local url=$2
    local expected_text=$3
    
    echo -n "Testing $page_name... "
    
    response=$(curl -s "$url")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$http_code" != "200" ]; then
        echo -e "${RED}FAILED${NC} (HTTP $http_code)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
    
    if echo "$response" | grep -q "$expected_text"; then
        echo -e "${GREEN}PASSED${NC}"
        return 0
    else
        echo -e "${RED}FAILED${NC} (Expected text not found)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

test_no_korean_when_english() {
    local page_name=$1
    local url=$2
    
    echo -n "Testing $page_name (English - no Korean)... "
    
    response=$(curl -s "${url}?lang=en")
    
    # Check for common hardcoded Korean patterns
    if echo "$response" | grep -qP '[가-힣]{2,}' | grep -v "script" | head -1; then
        echo -e "${RED}FAILED${NC} (Korean text found in English mode)"
        echo "Found: $(echo "$response" | grep -oP '[가-힣]{2,}' | head -3)"
        ERRORS=$((ERRORS + 1))
        return 1
    else
        echo -e "${GREEN}PASSED${NC}"
        return 0
    fi
}

echo "=== Priority 1: Academy Page ==="
test_page "Academy (KO)" "$BASE_URL/nft-academy" "NFT"
test_page "Academy (EN)" "$BASE_URL/nft-academy?lang=en" "Coming Soon"
test_page "Academy (ZH)" "$BASE_URL/nft-academy?lang=zh" "即将推出"
test_page "Academy (JA)" "$BASE_URL/nft-academy?lang=ja" "まもなく"
echo ""

echo "=== Priority 2: Signup Page ==="
test_page "Signup (KO)" "$BASE_URL/signup" "회원가입"
test_no_korean_when_english "Signup" "$BASE_URL/signup"
echo ""

echo "=== Priority 3: Login Page ==="
test_page "Login (KO)" "$BASE_URL/login" "로그인"
test_no_korean_when_english "Login" "$BASE_URL/login"
echo ""

echo "=== Priority 4: Recommendations Page ==="
test_page "Recommendations (KO)" "$BASE_URL/recommendations" "추천"
test_no_korean_when_english "Recommendations" "$BASE_URL/recommendations"
echo ""

echo "=== Priority 5: Artwork Detail (Purchase Button Removed) ==="
echo -n "Testing Artwork Detail (No Purchase Button)... "
response=$(curl -s "$BASE_URL/artwork/1")
if echo "$response" | grep -q "구매 제안하기"; then
    echo -e "${RED}FAILED${NC} (Purchase button still exists)"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}PASSED${NC}"
fi
echo ""

echo "===================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - 0% ERROR RATE ACHIEVED!${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS TEST(S) FAILED${NC}"
    echo "Target: 0% Error Rate - Requires fixes"
    exit 1
fi
