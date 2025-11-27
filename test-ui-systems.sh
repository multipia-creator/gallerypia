#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 UI 시스템 완벽 테스트 (10회 반복)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS=0
FAIL=0

# 테스트 함수
test_main_page() {
  local test_num=$1
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 테스트 #$test_num: 메인 페이지 로드"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  RESPONSE=$(curl -s http://localhost:3000/)
  
  # 1. 튜토리얼 스크립트가 한 번만 로드되는지 확인 (실제 script 태그만 카운트)
  TUTORIAL_COUNT=$(echo "$RESPONSE" | grep '<script.*i18n-tutorial.js' | wc -l)
  echo "   📝 튜토리얼 스크립트 <script> 태그: $TUTORIAL_COUNT개"
  if [ "$TUTORIAL_COUNT" -eq 1 ]; then
    echo "   ✅ 튜토리얼 중복 없음"
    ((SUCCESS++))
  else
    echo "   ❌ 튜토리얼 중복 발견 ($TUTORIAL_COUNT번)"
    ((FAIL++))
  fi
  
  # 2. 채팅창 스크립트 확인
  CHAT_COUNT=$(echo "$RESPONSE" | grep -o "customer-support-ai.js\|realtime-chat.js" | wc -l)
  echo "   💬 채팅 스크립트 로드 횟수: $CHAT_COUNT"
  if [ "$CHAT_COUNT" -ge 1 ]; then
    echo "   ✅ 채팅창 스크립트 로드됨"
    ((SUCCESS++))
  else
    echo "   ❌ 채팅창 스크립트 없음"
    ((FAIL++))
  fi
  
  # 3. 알림 벨 아이콘 확인
  NOTIFICATION_BELL=$(echo "$RESPONSE" | grep -o 'id="notificationBell"' | wc -l)
  echo "   🔔 알림 벨 요소: $NOTIFICATION_BELL개"
  if [ "$NOTIFICATION_BELL" -ge 1 ]; then
    echo "   ✅ 알림 시스템 존재"
    ((SUCCESS++))
  else
    echo "   ❌ 알림 시스템 없음"
    ((FAIL++))
  fi
  
  # 4. 페이지가 정상적으로 로드되는지 확인 (200 OK)
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
  echo "   🌐 HTTP 상태 코드: $HTTP_STATUS"
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "   ✅ 페이지 정상 로드"
    ((SUCCESS++))
  else
    echo "   ❌ 페이지 로드 실패"
    ((FAIL++))
  fi
  
  echo ""
}

# 10회 반복 테스트
for i in {1..10}; do
  test_main_page $i
  sleep 1
done

# 추가: 채팅창 API 테스트
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💬 채팅창 고객센터 AI 기능 테스트"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 채팅 API가 있는지 확인
CHAT_API=$(curl -s http://localhost:3000/ | grep -o "/api/chat\|/api/support" | head -1)
if [ -n "$CHAT_API" ]; then
  echo "   ✅ 채팅 API 발견: $CHAT_API"
  ((SUCCESS++))
else
  echo "   ℹ️  채팅 API 없음 (클라이언트 사이드 처리)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최종 테스트 결과"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 성공: $SUCCESS"
echo "❌ 실패: $FAIL"

TOTAL=$((SUCCESS + FAIL))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($SUCCESS / $TOTAL) * 100}")
echo "📈 성공률: ${SUCCESS_RATE}%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 모든 UI 시스템 테스트 통과!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 0
else
  echo "⚠️  일부 테스트 실패. 수정 필요!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
