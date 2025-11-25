#!/bin/bash
# DNS Propagation Monitor for gallerypia.com

CLOUDFLARE_API_TOKEN="5U9cOEp4hohFjyYJOfbFM9jNlPL-RabsvLZEtrKu"
ZONE_ID="7547f0c0b89e1221563c74db70750f74"
ACCOUNT_ID="93f0a4408e700959a95a837c906ec6e8"
PROJECT_NAME="gallerypia"

echo "================================================"
echo "🔍 GalleryPia DNS 전파 상태 확인"
echo "================================================"
echo ""

# Check Cloudflare Zone Status
echo "📡 Cloudflare Zone 상태 확인 중..."
ZONE_DATA=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")

ZONE_STATUS=$(echo "$ZONE_DATA" | jq -r '.result.status')
NAME_SERVERS=$(echo "$ZONE_DATA" | jq -r '.result.name_servers | join(", ")')

echo "현재 상태: $ZONE_STATUS"
echo "Cloudflare 네임서버: $NAME_SERVERS"
echo ""

if [ "$ZONE_STATUS" = "active" ]; then
    echo "✅ DNS가 ACTIVE 상태입니다!"
    echo "✅ 네임서버 전파가 완료되었습니다!"
    echo ""
    echo "🚀 gallerypia.com을 Pages 프로젝트에 연결 중..."
    
    # Remove old deactivated domains first
    echo "🧹 기존 비활성 도메인 제거 중..."
    EXISTING_DOMAINS=$(curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN")
    
    DOMAIN_IDS=$(echo "$EXISTING_DOMAINS" | jq -r '.result[] | select(.name=="gallerypia.com" or .name=="www.gallerypia.com") | .id')
    
    for DOMAIN_ID in $DOMAIN_IDS; do
        echo "   삭제 중: $DOMAIN_ID"
        curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains/$DOMAIN_ID" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" > /dev/null
    done
    
    echo "✅ 기존 도메인 제거 완료"
    echo ""
    
    # Add gallerypia.com
    echo "📌 gallerypia.com 추가 중..."
    ADD_RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"name":"gallerypia.com"}')
    
    ADD_SUCCESS=$(echo "$ADD_RESULT" | jq -r '.success')
    
    if [ "$ADD_SUCCESS" = "true" ]; then
        echo "✅ gallerypia.com 추가 성공!"
        echo ""
        echo "⏳ SSL 인증서 발급 중 (5-10분 소요)..."
        echo ""
        echo "================================================"
        echo "🎉 설정 완료!"
        echo "================================================"
        echo ""
        echo "접속 URL:"
        echo "  🌐 https://gallerypia.com (5-10분 후 접속 가능)"
        echo "  🌐 https://gallerypia.pages.dev (현재 사용 가능)"
        echo ""
        echo "데모 계정으로 로그인 테스트:"
        echo "  관리자: admin@demo.com / admin1234"
        echo ""
    else
        ERROR_MSG=$(echo "$ADD_RESULT" | jq -r '.errors[0].message')
        echo "⚠️  도메인 추가 실패: $ERROR_MSG"
        echo ""
        echo "대체 URL 사용: https://gallerypia.pages.dev"
    fi
    
elif [ "$ZONE_STATUS" = "moved" ]; then
    echo "⏳ DNS 상태: MOVED"
    echo "⏳ 네임서버 전파 대기 중..."
    echo ""
    echo "📋 현재 진행 상황:"
    echo "   ✅ Cloudflare에서 준비 완료"
    echo "   ⏳ hosting.kr에서 네임서버 전파 중"
    echo ""
    echo "🔧 hosting.kr에서 네임서버 변경을 완료하셨나요?"
    echo ""
    echo "   변경한 네임서버:"
    echo "   ✓ amalia.ns.cloudflare.com"
    echo "   ✓ sonny.ns.cloudflare.com"
    echo ""
    echo "⏱️  예상 대기 시간:"
    echo "   • 최소: 30분"
    echo "   • 평균: 1-2시간"
    echo "   • 최대: 24시간"
    echo ""
    echo "💡 이 스크립트를 30분마다 다시 실행하시면 상태를 확인할 수 있습니다:"
    echo "   bash /home/user/webapp/scripts/dns-monitor.sh"
    echo ""
    echo "🌐 현재 사용 가능한 URL:"
    echo "   https://gallerypia.pages.dev"
    
elif [ "$ZONE_STATUS" = "pending" ]; then
    echo "⏳ DNS 상태: PENDING"
    echo "⏳ Cloudflare 설정 진행 중..."
    echo ""
    echo "잠시 후 다시 확인해주세요."
    
else
    echo "⚠️  예상치 못한 상태: $ZONE_STATUS"
    echo ""
    echo "Cloudflare 대시보드 확인:"
    echo "https://dash.cloudflare.com/7547f0c0b89e1221563c74db70750f74"
fi

echo ""
echo "================================================"
