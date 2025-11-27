#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  데이터베이스 스키마 일관성 검사"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 주요 테이블 존재 확인
TABLES=(
  "users"
  "user_sessions"
  "artist_profiles"
  "expert_profiles"
  "organizations"
  "artworks"
  "login_history"
)

SUCCESS=0
FAIL=0
ERRORS=()

for TABLE in "${TABLES[@]}"; do
  RESULT=$(npx wrangler d1 execute gallerypia-production --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name='$TABLE'" 2>/dev/null | grep -c "$TABLE" || echo "0")
  
  if [ "$RESULT" -gt 0 ]; then
    echo "   ✅ 테이블 존재: $TABLE"
    ((SUCCESS++))
  else
    echo "   ❌ 테이블 없음: $TABLE"
    ERRORS+=("테이블 누락: $TABLE")
    ((FAIL++))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 성공: $SUCCESS / ${#TABLES[@]}"
echo "❌ 실패: $FAIL / ${#TABLES[@]}"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "⚠️  발견된 오류:"
  for ERROR in "${ERRORS[@]}"; do
    echo "   - $ERROR"
  done
fi

echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 모든 테이블 정상!"
  exit 0
else
  echo "⚠️  일부 테이블 누락. 마이그레이션 필요!"
  exit 1
fi
