/**
 * API Tests for Credit Balance System
 * Tests the actual API endpoints with credit scenarios
 */

interface ApiTestScenario {
  name: string;
  description: string;
  endpoint: string;
  method: string;
  payload?: any;
  expectedStatus: number;
  validate: (response: any) => boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper function to make API calls
async function makeApiCall(
  endpoint: string,
  method: string = "GET",
  payload?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any }> {
  const url = `${API_BASE}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (payload && method !== "GET") {
    options.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { status: 500, data: { error: errorMessage } };
  }
}

const apiTests: ApiTestScenario[] = [
  {
    name: "Get User Dues",
    description: "Test retrieving user dues with credit information",
    endpoint: "/api/user-dues",
    method: "GET",
    expectedStatus: 200,
    validate: (response) => {
      return (
        response.success &&
        Array.isArray(response.dues) &&
        response.dues.every((due: any) =>
          typeof due.creditBalance === "number" &&
          typeof due.creditUsed === "number" &&
          typeof due.netDue === "number"
        )
      );
    },
  },
  {
    name: "Create Due with Credit",
    description: "Test creating a due record with credit calculations",
    endpoint: "/api/user-dues",
    method: "POST",
    payload: {
      userId: "test-user-id",
      month: "January",
      year: 2025,
      monthNumber: 1,
      forceRecalculate: true,
    },
    expectedStatus: 200,
    validate: (response) => {
      return (
        response.success &&
        response.due &&
        typeof response.due.creditBalance === "number" &&
        typeof response.due.creditUsed === "number" &&
        typeof response.due.netDue === "number"
      );
    },
  },
];

async function runApiTests(): Promise<boolean> {
  console.log("🌐 Starting Credit System API Tests...\n");

  let passedTests = 0;
  const totalTests = apiTests.length;

  // Check if we can reach the API
  try {
    console.log("🔗 Checking API connectivity...");
    const healthCheck = await makeApiCall("/api/health");
    if (healthCheck.status !== 200) {
      console.log("⚠️  API health check failed. Skipping API tests.");
      console.log("   Make sure your Next.js server is running on the correct port");
      return false;
    }
    console.log("✅ API is reachable\n");
  } catch (error) {
    console.log("❌ Cannot reach API. Skipping API tests.");
    console.log("   Error:", error);
    return false;
  }

  // Run each API test
  for (const test of apiTests) {
    console.log(`📋 Testing: ${test.name}`);
    console.log(`   ${test.description}`);

    try {
      const result = await makeApiCall(
        test.endpoint,
        test.method,
        test.payload
      );

      // Check status code
      if (result.status !== test.expectedStatus) {
        console.log(`   ❌ FAILED - Status Code`);
        console.log(`      Expected: ${test.expectedStatus}, Got: ${result.status}`);
        console.log(`      Response: ${JSON.stringify(result.data, null, 2)}`);
        continue;
      }

      // Validate response
      if (!test.validate(result.data)) {
        console.log(`   ❌ FAILED - Validation`);
        console.log(`      Response: ${JSON.stringify(result.data, null, 2)}`);
        continue;
      }

      console.log("   ✅ PASSED");
      passedTests++;

    } catch (error) {
      console.log("   ❌ ERROR:", error);
    }

    console.log("");
  }

  console.log(`📊 API Test Summary: ${passedTests}/${totalTests} passed`);
  return passedTests === totalTests;
}

async function testCreditCalculationEndpoint() {
  console.log("\n🧮 Testing Credit Calculation Logic via API...");

  const testPayload = {
    userId: "mock-user-id",
    month: "January",
    year: 2025,
    monthNumber: 1,
    forceRecalculate: true,
    mockData: {
      roomPrice: 5000,
      previousCredit: 1000,
      currentPayment: 6000,
      previousUnpaid: 500,
    },
  };

  try {
    const result = await makeApiCall("/api/user-dues", "POST", testPayload);

    if (result.status === 200 && result.data.success) {
      const due = result.data.due;
      console.log("   📊 Credit Calculation Results:");
      console.log(`      Total Due: ₹${due.totalDue}`);
      console.log(`      Total Paid: ₹${due.totalPaid}`);
      console.log(`      Credit Balance: ₹${due.creditBalance}`);
      console.log(`      Credit Used: ₹${due.creditUsed}`);
      console.log(`      Net Due: ₹${due.netDue}`);
      console.log(`      Status: ${due.dueStatus}`);
      console.log("   ✅ Calculation endpoint working");
      return true;
    } else {
      console.log("   ❌ Calculation endpoint failed");
      console.log(`      Status: ${result.status}`);
      console.log(`      Response: ${JSON.stringify(result.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log("   ❌ Error testing calculation endpoint:", error);
    return false;
  }
}

async function main() {
  console.log("🚀 Credit Balance System API Tests\n");
  console.log("=" .repeat(50));
  console.log("Testing API endpoints with credit balance functionality");
  console.log("Make sure your Next.js development server is running");
  console.log("=" .repeat(50));

  // Run basic API tests
  const basicTestsPass = await runApiTests();

  // Run credit calculation specific test
  const calculationTestPass = await testCreditCalculationEndpoint();

  console.log("\n" + "=" .repeat(50));
  console.log("🎯 API Test Results:");
  console.log(`   Basic API Tests: ${basicTestsPass ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`   Credit Calculation: ${calculationTestPass ? "✅ PASSED" : "❌ FAILED"}`);

  const allTestsPass = basicTestsPass && calculationTestPass;

  if (allTestsPass) {
    console.log("\n🎉 All API tests passed!");
    console.log("   - API endpoints are responding correctly");
    console.log("   - Credit calculations are working via API");
    console.log("   - Response formats include credit fields");
  } else {
    console.log("\n⚠️  Some API tests failed");
    console.log("   Please ensure:");
    console.log("   - Next.js server is running");
    console.log("   - Database is connected");
    console.log("   - Credit system is properly integrated");
  }

  console.log("\n" + "=" .repeat(50));
  process.exit(allTestsPass ? 0 : 1);
}

// Run API tests
main().catch(console.error);
