#!/bin/bash
# Quick fix for routes missing lang parameter

echo "🔧 Fixing routes missing 'lang' parameter..."

# List of routes that need lang parameter
ROUTES_TO_FIX=(
  "'/about'"
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

for route in "${ROUTES_TO_FIX[@]}"; do
  # Check if route already has getUserLanguage
  if grep -q "app.get($route" src/index.tsx; then
    COUNT=$(grep -A3 "app.get($route" src/index.tsx | grep -c "getUserLanguage")
    if [ "$COUNT" -eq "0" ]; then
      echo "  ⚠️  $route needs getUserLanguage(c) - manual fix required"
    else
      echo "  ✅ $route already has getUserLanguage"
    fi
  else
    echo "  ℹ️  $route not found"
  fi
done

echo ""
echo "✅ Analysis complete!"
