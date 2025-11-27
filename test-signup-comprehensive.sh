#!/bin/bash

echo "🧪 회원가입 전체 테스트 시작..."
echo ""

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/auth"

# 테스트 사용자 데이터
declare -A users=(
  ["general"]="general_test@gallerypia.com:Test1234!@#:일반사용자:general_user"
  ["buyer"]="buyer_test@gallerypia.com:Test1234!@#:구매자:buyer_user"
  ["seller"]="seller_test@gallerypia.com:Test1234!@#:판매자:seller_user"
  ["artist"]="artist_test@gallerypia.com:Test1234!@#:아티스트:artist_user"
  ["curator"]="curator_test@gallerypia.com:Test1234!@#:큐레이터:curator_user"
)

success_count=0
fail_count=0

# 각 역할별 회원가입 테스트
for role in general buyer seller artist curator; do
  IFS=':' read -r email password full_name username <<< "${users[$role]}"
  
  echo "📝 테스트 $((success_count + fail_count + 1)): $role 계정 생성"
  echo "   이메일: $email"
  
  response=$(curl -s -X POST "$API_URL/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"full_name\":\"$full_name\",\"username\":\"$username\",\"role\":\"$role\"}")
  
  if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
    echo "   ✅ 성공"
    ((success_count++))
  else
    echo "   ❌ 실패: $(echo "$response" | jq -r '.error // "Unknown error"')"
    ((fail_count++))
  fi
  echo ""
  sleep 1
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 성공: $success_count / 5"
echo "❌ 실패: $fail_count / 5"
echo "📈 성공률: $(( success_count * 100 / 5 ))%"
echo ""

if [ $fail_count -eq 0 ]; then
  echo "🎉 모든 테스트 통과! 오류율 0%"
  exit 0
else
  echo "⚠️  일부 테스트 실패. 수정 필요"
  exit 1
fi
