#!/bin/bash

# API Decks Performance Test Script
# Tests the /api/decks endpoint and measures network timing

echo "🧪 Testing GET /api/decks performance..."
echo ""

# Create curl timing format file
cat > /tmp/curl-format.txt << 'EOF'
time_namelookup:    %{time_namelookup}s\n
time_connect:       %{time_connect}s\n
time_appconnect:    %{time_appconnect}s\n
time_pretransfer:   %{time_pretransfer}s\n
time_starttransfer: %{time_starttransfer}s (TTFB)\n
time_total:         %{time_total}s\n
size_download:      %{size_download} bytes\n
speed_download:     %{speed_download} bytes/sec\n
EOF

echo "📊 Test 1: Single Request"
echo "=========================="
curl -s -w "@/tmp/curl-format.txt" \
  -H "Cookie: $(cat /tmp/session-cookie.txt 2>/dev/null || echo '')" \
  -o /tmp/decks-response.json \
  http://localhost:3000/api/decks

echo ""
echo "Response preview:"
cat /tmp/decks-response.json | jq '.decks | length' 2>/dev/null || echo "No decks or jq not installed"

echo ""
echo "📊 Test 2: Multiple Requests (Average)"
echo "======================================="

total_time=0
count=5

for i in $(seq 1 $count); do
  echo "Request $i..."
  time=$(curl -s -w "%{time_total}\n" \
    -H "Cookie: $(cat /tmp/session-cookie.txt 2>/dev/null || echo '')" \
    -o /dev/null \
    http://localhost:3000/api/decks)
  total_time=$(echo "$total_time + $time" | bc)
done

avg_time=$(echo "scale=3; $total_time / $count" | bc)
echo ""
echo "Average time over $count requests: ${avg_time}s"

echo ""
echo "💡 Next Steps:"
echo "1. Check server console for detailed timing logs"
echo "2. Look for '🕐 GET /api/decks Detailed Timing' output"
echo "3. If TTFB > 1s, focus on optimizing the slowest operation"
echo ""
echo "📖 See docs/api-decks-network-analysis.md for full analysis"

# Cleanup
rm -f /tmp/curl-format.txt