#!/bin/bash
# Batch fix for routes missing getUserLanguage

ROUTES=(
  "'/support'"
  "'/help'"
  "'/contact'"
  "'/privacy'"
  "'/dashboard'"
  "'/search'"
  "'/leaderboard'"
  "'/valuation-system'"
  "'/analytics-dashboard'"
  "'/transactions'"
  "'/forgot-password'"
)

for route in "${ROUTES[@]}"; do
  PATTERN="app.get($route, (c) => {"
  if grep -q "$PATTERN" src/index.tsx 2>/dev/null; then
    # Check if it already has getUserLanguage
    LINE_NUM=$(grep -n "$PATTERN" src/index.tsx | cut -d: -f1)
    NEXT_LINES=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+5))p" src/index.tsx)
    if ! echo "$NEXT_LINES" | grep -q "getUserLanguage"; then
      echo "❌ $route at line $LINE_NUM needs fix"
    else
      echo "✅ $route already OK"
    fi
  fi
done
