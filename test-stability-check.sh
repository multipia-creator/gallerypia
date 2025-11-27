#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 시스템 안정성 검증 (20회 반복 테스트)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ITERATIONS=20
TOTAL_SUCCESS=0
TOTAL_FAIL=0
FAILED_TESTS=()

for i in $(seq 1 $ITERATIONS); do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 테스트 반복 #$i / $ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  ITERATION_SUCCESS=0
  ITERATION_FAIL=0
  
  # 1. 메인 페이지 로드
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/" 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ 메인 페이지 로드: HTTP $STATUS"
    ((ITERATION_SUCCESS++))
  else
    echo "   ❌ 메인 페이지 로드: HTTP $STATUS"
    FAILED_TESTS+=("반복 #$i: 메인 페이지 실패 (HTTP $STATUS)")
    ((ITERATION_FAIL++))
  fi
  
  # 2. 로그인 페이지
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/login" 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ 로그인 페이지: HTTP $STATUS"
    ((ITERATION_SUCCESS++))
  else
    echo "   ❌ 로그인 페이지: HTTP $STATUS"
    FAILED_TESTS+=("반복 #$i: 로그인 페이지 실패")
    ((ITERATION_FAIL++))
  fi
  
  # 3. 회원가입 API 테스트
  TIMESTAMP=$(date +%s)
  RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test_${TIMESTAMP}@test.com\",\"username\":\"test${TIMESTAMP}\",\"full_name\":\"Test User\",\"password\":\"Test1234!@#\",\"role\":\"buyer\"}" 2>/dev/null)
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ 회원가입: 성공"
    ((ITERATION_SUCCESS++))
  else
    echo "   ❌ 회원가입: 실패"
    echo "      응답: $RESPONSE"
    FAILED_TESTS+=("반복 #$i: 회원가입 실패")
    ((ITERATION_FAIL++))
  fi
  
  # 4. 로그인 API 테스트
  sleep 0.5
  RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test_${TIMESTAMP}@test.com\",\"password\":\"Test1234!@#\"}" 2>/dev/null)
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ 로그인: 성공"
    ((ITERATION_SUCCESS++))
  else
    echo "   ❌ 로그인: 실패"
    echo "      응답: $RESPONSE"
    FAILED_TESTS+=("반복 #$i: 로그인 실패")
    ((ITERATION_FAIL++))
  fi
  
  # 5. API 엔드포인트
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/artworks" 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ Artworks API: HTTP $STATUS"
    ((ITERATION_SUCCESS++))
  else
    echo "   ❌ Artworks API: HTTP $STATUS"
    FAILED_TESTS+=("반복 #$i: Artworks API 실패")
    ((ITERATION_FAIL++))
  fi
  
  # 6. 정적 파일
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/static/styles.css" 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ CSS 파일: HTTP $STATUS"
    ((ITERATION_SUCCESS++))
  else
    echo "   ❌ CSS 파일: HTTP $STATUS"
    FAILED_TESTS+=("반복 #$i: CSS 파일 실패")
    ((ITERATION_FAIL++))
  fi
  
  # 반복 결과
  echo ""
  echo "   📊 반복 #$i 결과: $ITERATION_SUCCESS 성공 / $ITERATION_FAIL 실패"
  
  TOTAL_SUCCESS=$((TOTAL_SUCCESS + ITERATION_SUCCESS))
  TOTAL_FAIL=$((TOTAL_FAIL + ITERATION_FAIL))
  
  echo ""
  
  # 다음 반복 전 짧은 대기
  sleep 0.3
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최종 안정성 검증 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((TOTAL_SUCCESS + TOTAL_FAIL))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_SUCCESS / $TOTAL_TESTS) * 100}")
ERROR_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_FAIL / $TOTAL_TESTS) * 100}")

echo "   🔄 총 반복 횟수: $ITERATIONS회"
echo "   ✅ 전체 성공: $TOTAL_SUCCESS / $TOTAL_TESTS"
echo "   ❌ 전체 실패: $TOTAL_FAIL / $TOTAL_TESTS"
echo "   📈 성공률: $SUCCESS_RATE%"
echo "   📉 오류율: $ERROR_RATE%"
echo ""

if [ $TOTAL_FAIL -gt 0 ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "⚠️  발견된 실패 목록"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  for FAILED in "${FAILED_TESTS[@]}"; do
    echo "   - $FAILED"
  done
  echo ""
  echo "⚠️  시스템 불안정!"
  exit 1
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 모든 반복 테스트 성공!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "✨ 시스템 안정성 100% 검증 완료!"
  exit 0
fi
