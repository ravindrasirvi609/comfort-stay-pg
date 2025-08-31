#!/bin/bash

# Credit Balance System - Test Suite Runner
# This script runs all available tests for the credit balance system

echo "🚀 Credit Balance System - Complete Test Suite"
echo "=" | head -c 60 | tr '\0' '='
echo ""
echo "This will run all tests for the credit balance system:"
echo "• Unit tests for calculation functions"
echo "• Integration tests with database operations"
echo "• Edge case validation"
echo "• Real-world scenario testing"
echo ""

# Check if Node.js and required dependencies are available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

if ! command -v tsx &> /dev/null && ! npx tsx --version &> /dev/null; then
    echo "⚠️  tsx not found. Installing..."
    npm install -g tsx
fi

echo "🔍 Available Tests:"
echo ""
echo "1. Unit Tests (Recommended - Always run this first)"
echo "   - Tests all calculation functions"
echo "   - Tests utility functions"
echo "   - Tests edge cases"
echo "   - No database connection required"
echo ""
echo "2. Integration Tests (Requires database)"
echo "   - Tests with actual database operations"
echo "   - Creates and cleans up test data"
echo "   - Tests real-world scenarios"
echo "   - Requires MongoDB connection"
echo ""
echo "3. API Tests (Requires running server)"
echo "   - Tests API endpoints"
echo "   - Requires Next.js server to be running"
echo "   - Tests HTTP requests/responses"
echo ""
echo "4. All Tests (Complete suite)"
echo "   - Runs all tests sequentially"
echo "   - Most comprehensive validation"
echo ""

# Function to run unit tests
run_unit_tests() {
    echo "🧪 Running Unit Tests..."
    echo "=" | head -c 40 | tr '\0' '='
    echo ""
    npx tsx src/scripts/testCreditSystem.ts
    return $?
}

# Function to run integration tests
run_integration_tests() {
    echo "🔗 Running Integration Tests..."
    echo "=" | head -c 40 | tr '\0' '='
    echo ""
    echo "⚠️  Note: This requires a MongoDB connection."
    echo "⚠️  Test data will be created and cleaned up automatically."
    echo ""
    npx tsx src/scripts/testCreditIntegration.ts
    return $?
}

# Function to run API tests
run_api_tests() {
    echo "🌐 Running API Tests..."
    echo "=" | head -c 40 | tr '\0' '='
    echo ""
    echo "⚠️  Note: This requires your Next.js server to be running."
    echo "⚠️  Make sure your development server is started before running this test."
    echo ""
    npx tsx src/scripts/testCreditApi.ts
    return $?
}

# Function to run all tests
run_all_tests() {
    echo "🎯 Running Complete Test Suite..."
    echo "=" | head -c 40 | tr '\0' '='
    echo ""
    npx tsx src/scripts/runCreditTests.ts
    return $?
}

# Main menu
echo "Which tests would you like to run?"
echo ""
echo "Enter your choice (1-4) or 'q' to quit:"
read -p "> " choice

case $choice in
    1)
        run_unit_tests
        exit_code=$?
        ;;
    2)
        run_integration_tests
        exit_code=$?
        ;;
    3)
        run_api_tests
        exit_code=$?
        ;;
    4)
        run_all_tests
        exit_code=$?
        ;;
    q|Q)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please select 1, 2, 3, 4, or 'q'."
        exit 1
        ;;
esac

# Show results
echo ""
echo "=" | head -c 60 | tr '\0' '='
if [ $exit_code -eq 0 ]; then
    echo "✅ All tests completed successfully!"
    echo ""
    echo "🎉 Your Credit Balance System is working correctly!"
    echo ""
    echo "Next steps:"
    echo "• Update UI components to display credit information"
    echo "• Create admin dashboard for credit management" 
    echo "• Add monitoring for credit operations"
    echo "• Update user documentation"
else
    echo "❌ Some tests failed!"
    echo ""
    echo "⚠️  Please review the test output above and fix any issues"
    echo "   before deploying to production."
    echo ""
    echo "Common issues:"
    echo "• Database connection problems (for integration tests)"
    echo "• Server not running (for API tests)"
    echo "• Missing dependencies"
    echo "• Configuration issues"
fi

echo ""
echo "=" | head -c 60 | tr '\0' '='
exit $exit_code
