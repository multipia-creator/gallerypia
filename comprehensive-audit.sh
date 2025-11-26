#!/bin/bash

# GalleryPia Comprehensive UX/UI Audit Script
# Automated testing for all pages and features

BASE_URL="https://4c4a49ae.gallerypia.pages.dev"
REPORT_FILE="/home/user/webapp/AUDIT_REPORT.md"
LANGS=("ko" "en" "zh" "ja")

echo "# GalleryPia NFT Platform - Comprehensive UX/UI Audit Report" > $REPORT_FILE
echo "Generated: $(date)" >> $REPORT_FILE
echo "Production URL: $BASE_URL" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Function to test page accessibility
test_page() {
    local page=$1
    local desc=$2
    local lang=$3
    
    echo "Testing: $page?lang=$lang - $desc"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${page}?lang=${lang}")
    
    if [ "$status" = "200" ]; then
        echo "✅ PASS"
        return 0
    else
        echo "❌ FAIL (HTTP $status)"
        echo "- ❌ **$desc** ($page?lang=$lang) - HTTP $status" >> $REPORT_FILE
        return 1
    fi
}

# Function to check for Korean text in English pages
check_translation() {
    local page=$1
    local desc=$2
    
    echo "Checking translation: $page - $desc"
    
    korean_text=$(curl -s "${BASE_URL}${page}?lang=en" | grep -o '[가-힣]' | head -5)
    
    if [ -z "$korean_text" ]; then
        echo "✅ No Korean text found in English page"
        return 0
    else
        echo "⚠️ Korean text found in English page"
        echo "- ⚠️ **$desc** ($page) - Contains untranslated Korean text" >> $REPORT_FILE
        return 1
    fi
}

# Function to check for broken links
check_links() {
    local page=$1
    local desc=$2
    
    echo "Checking links: $page - $desc"
    
    # Extract all href links
    links=$(curl -s "${BASE_URL}${page}" | grep -o 'href="[^"]*"' | sed 's/href="//;s/"$//' | grep -E '^/[^/]' | head -10)
    
    broken_count=0
    for link in $links; do
        status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${link}")
        if [ "$status" != "200" ]; then
            echo "  ❌ Broken link: $link (HTTP $status)"
            ((broken_count++))
        fi
    done
    
    if [ $broken_count -eq 0 ]; then
        echo "✅ All links working"
        return 0
    else
        echo "❌ $broken_count broken links found"
        echo "- ❌ **$desc** ($page) - $broken_count broken links" >> $REPORT_FILE
        return 1
    fi
}

echo "" >> $REPORT_FILE
echo "## Phase 1: Authentication & User Management" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Test authentication pages
for lang in "${LANGS[@]}"; do
    test_page "/signup" "Registration Page" "$lang"
    test_page "/login" "Login Page" "$lang"
    test_page "/forgot-password" "Forgot Password" "$lang"
    test_page "/profile" "Profile Page" "$lang"
    test_page "/settings" "Settings Page" "$lang"
    test_page "/mypage" "My Page" "$lang"
done

echo "" >> $REPORT_FILE
echo "## Phase 2: Core NFT Functionality" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Test core pages
for lang in "${LANGS[@]}"; do
    test_page "/" "Home Page" "$lang"
    test_page "/gallery" "Gallery" "$lang"
    test_page "/mint" "Mint NFT" "$lang"
    test_page "/valuation" "Valuation System" "$lang"
done

echo "" >> $REPORT_FILE
echo "## Phase 3: Advanced Features" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Test advanced features
for lang in "${LANGS[@]}"; do
    test_page "/recommendations" "Recommendations" "$lang"
    test_page "/search" "Search" "$lang"
    test_page "/artists" "Artists" "$lang"
    test_page "/leaderboard" "Leaderboard" "$lang"
    test_page "/collections" "Collections" "$lang"
    test_page "/favorites" "Favorites" "$lang"
done

echo "" >> $REPORT_FILE
echo "## Phase 4: Dashboard & Analytics" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Test dashboards
for lang in "${LANGS[@]}"; do
    test_page "/dashboard" "Dashboard" "$lang"
    test_page "/dashboard/artist" "Artist Dashboard" "$lang"
    test_page "/dashboard/expert" "Expert Dashboard" "$lang"
    test_page "/analytics-dashboard" "Analytics" "$lang"
    test_page "/transactions" "Transactions" "$lang"
done

echo "" >> $REPORT_FILE
echo "## Phase 5: Information & Support" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Test information pages
for lang in "${LANGS[@]}"; do
    test_page "/about" "About Page" "$lang"
    test_page "/nft-academy" "NFT Academy" "$lang"
    test_page "/support" "Support" "$lang"
    test_page "/help" "Help" "$lang"
    test_page "/contact" "Contact" "$lang"
    test_page "/privacy" "Privacy" "$lang"
done

echo "" >> $REPORT_FILE
echo "## Translation Issues" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check critical pages for translation issues
check_translation "/signup" "Signup Page"
check_translation "/login" "Login Page"
check_translation "/recommendations" "Recommendations"
check_translation "/about" "About Page"

echo "" >> $REPORT_FILE
echo "## Link Integrity" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Check for broken links on main pages
check_links "/" "Home Page"
check_links "/gallery" "Gallery"
check_links "/about" "About Page"

echo ""
echo "============================================"
echo "Audit Complete! Report saved to:"
echo "$REPORT_FILE"
echo "============================================"
