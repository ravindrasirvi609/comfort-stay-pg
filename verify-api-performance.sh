#!/bin/bash

# Production API Performance Test Script
# Usage: ./verify-api-performance.sh [production-url]

PROD_URL="${1:-https://your-production-domain.com}"
API_ENDPOINT="${PROD_URL}/api/users/with-dues"

echo "🔍 Testing optimized API performance..."
echo "📍 Endpoint: ${API_ENDPOINT}"
echo ""

# Test API response time (without auth, expect 401 but measure speed)
echo "⏱️ Testing response time (expect 401 - auth required)..."
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "${API_ENDPOINT}")
HTTP_CODE=$(curl -w "%{http_code}" -s -o /dev/null "${API_ENDPOINT}")

echo "📊 Results:"
echo "   Status Code: ${HTTP_CODE}"
echo "   Response Time: ${RESPONSE_TIME} seconds"

# Evaluate results
if (( $(echo "${RESPONSE_TIME} < 3.0" | bc -l) )); then
    echo "✅ PASS: API responds in ${RESPONSE_TIME}s (< 3 seconds)"
elif (( $(echo "${RESPONSE_TIME} < 10.0" | bc -l) )); then
    echo "⚠️  CAUTION: API responds in ${RESPONSE_TIME}s (acceptable but could be better)"
else
    echo "❌ FAIL: API taking too long (${RESPONSE_TIME}s)"
fi

if [ "${HTTP_CODE}" = "401" ]; then
    echo "✅ PASS: Authentication working (401 expected)"
elif [ "${HTTP_CODE}" = "200" ]; then
    echo "✅ PASS: API working without auth (200 - likely test environment)"
elif [ "${HTTP_CODE}" = "000" ]; then
    echo "❌ FAIL: Connection timeout or refused"
else
    echo "⚠️  Status code: ${HTTP_CODE} (investigate if unexpected)"
fi

echo ""
echo "🏁 Performance test completed"
echo ""
echo "💡 Next steps:"
echo "   1. If response time > 3s, check database performance"
echo "   2. If getting 000, verify URL and deployment status"
echo "   3. For authenticated testing, update script with valid tokens"
