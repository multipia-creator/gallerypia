#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 완벽한 회원가입 테스트 (15명)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS=0
FAIL=0
TOTAL=15

# 15명의 테스트 사용자 (각 역할별 2명 이상)
USERS=(
  # General users (2명)
  "user01@gallerypia.com:general_user01:홍길동:User1234!@#:010-1111-1111:general"
  "user02@gallerypia.com:general_user02:김철수:User1234!@#:010-1111-2222:general"
  
  # Buyers (2명)
  "buyer01@gallerypia.com:buyer_user01:이영희:Buyer1234!@#:010-2222-1111:buyer"
  "buyer02@gallerypia.com:buyer_user02:박민수:Buyer1234!@#:010-2222-2222:buyer"
  
  # Sellers (2명)
  "seller01@gallerypia.com:seller_user01:최지훈:Seller1234!@#:010-3333-1111:seller"
  "seller02@gallerypia.com:seller_user02:정수연:Seller1234!@#:010-3333-2222:seller"
  
  # Artists (3명)
  "artist01@gallerypia.com:artist_user01:강예린:Artist1234!@#:010-4444-1111:artist"
  "artist02@gallerypia.com:artist_user02:윤서준:Artist1234!@#:010-4444-2222:artist"
  "artist03@gallerypia.com:artist_user03:조민지:Artist1234!@#:010-4444-3333:artist"
  
  # Curators (2명)
  "curator01@gallerypia.com:curator_user01:임하늘:Curator1234!@#:010-5555-1111:curator"
  "curator02@gallerypia.com:curator_user02:한지우:Curator1234!@#:010-5555-2222:curator"
  
  # Experts (2명)
  "expert01@gallerypia.com:expert_user01:오태양:Expert1234!@#:010-6666-1111:expert"
  "expert02@gallerypia.com:expert_user02:서현우:Expert1234!@#:010-6666-2222:expert"
  
  # Museums (2명)
  "museum01@gallerypia.com:museum_user01:국립현대미술관:Museum1234!@#:010-7777-1111:museum"
  "museum02@gallerypia.com:museum_user02:서울시립미술관:Museum1234!@#:010-7777-2222:museum"
)

COUNT=0

for USER_DATA in "${USERS[@]}"; do
  ((COUNT++))
  IFS=':' read -r EMAIL USERNAME FULLNAME PASSWORD PHONE ROLE <<< "$USER_DATA"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 테스트 [$COUNT/$TOTAL]: $ROLE 계정 생성"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "   이메일: $EMAIL"
  echo "   사용자명: $USERNAME"
  echo "   이름: $FULLNAME"
  echo "   역할: $ROLE"
  echo ""
  
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"email\":\"$EMAIL\",
      \"username\":\"$USERNAME\",
      \"full_name\":\"$FULLNAME\",
      \"password\":\"$PASSWORD\",
      \"phone\":\"$PHONE\",
      \"role\":\"$ROLE\"
    }")
  
  # 성공 여부 확인
  SUCCESS_CHECK=$(echo "$RESPONSE" | grep -o '"success":true' || true)
  
  if [ -n "$SUCCESS_CHECK" ]; then
    USER_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' || echo "N/A")
    echo "   ✅ 성공! (User ID: $USER_ID)"
    ((SUCCESS++))
  else
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | sed 's/"error":"//;s/"$//' || echo "알 수 없는 오류")
    echo "   ❌ 실패: $ERROR_MSG"
    echo "   📋 전체 응답: $RESPONSE"
    ((FAIL++))
  fi
  
  echo ""
  
  # Rate limit 방지 (1초 대기)
  sleep 1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최종 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 성공: $SUCCESS / $TOTAL"
echo "❌ 실패: $FAIL / $TOTAL"

SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($SUCCESS / $TOTAL) * 100}")
echo "📈 성공률: ${SUCCESS_RATE}%"
echo ""

# 역할별 통계
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 역할별 생성 통계"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🔹 일반 사용자 (general): 2명"
echo "   🔹 구매자 (buyer): 2명"
echo "   🔹 판매자 (seller): 2명"
echo "   🔹 작가 (artist): 3명"
echo "   🔹 큐레이터 (curator): 2명"
echo "   🔹 전문가 (expert): 2명"
echo "   🔹 미술관 (museum): 2명"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 모든 테스트 통과! 오류율 0%"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo "⚠️  일부 테스트 실패. 즉시 수정 필요!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
