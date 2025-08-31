/**
 * Test Runner for Credit Balance System
 * Executes all credit system test suites
 */

import { spawn } from "child_process";
import { resolve } from "path";

interface TestSuite {
  name: string;
  description: string;
  script: string;
  timeout?: number;
}

const testSuites: TestSuite[] = [
  {
    name: "Unit Tests",
    description: "Tests calculation functions and utility methods",
    script: "src/scripts/testCreditSystem.ts",
    timeout: 30000, // 30 seconds
  },
  {
    name: "Integration Tests",
    description: "Tests database operations and real-world scenarios",
    script: "src/scripts/testCreditIntegration.ts",
    timeout: 60000, // 60 seconds
  },
];

function runTestSuite(
  testSuite: TestSuite
): Promise<{ passed: boolean; output: string }> {
  return new Promise((resolve) => {
    console.log(`\n🧪 Starting ${testSuite.name}...`);
    console.log(`   ${testSuite.description}`);
    console.log(`   Script: ${testSuite.script}\n`);

    const child = spawn("npx", ["tsx", testSuite.script], {
      stdio: "pipe",
      shell: true,
      cwd: process.cwd(),
    });

    let output = "";
    let error = "";

    child.stdout.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (data) => {
      const chunk = data.toString();
      error += chunk;
      process.stderr.write(chunk);
    });

    // Set timeout
    const timeout = setTimeout(() => {
      console.log(`\n⏰ Test suite timed out after ${testSuite.timeout}ms`);
      child.kill("SIGTERM");
      resolve({ passed: false, output: output + error + "\n[TIMEOUT]" });
    }, testSuite.timeout || 30000);

    child.on("close", (code) => {
      clearTimeout(timeout);
      const passed = code === 0;

      if (passed) {
        console.log(`\n✅ ${testSuite.name} completed successfully`);
      } else {
        console.log(`\n❌ ${testSuite.name} failed with exit code ${code}`);
      }

      resolve({ passed, output: output + error });
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      console.error(`\n💥 Error running ${testSuite.name}:`, err);
      resolve({
        passed: false,
        output: output + error + `\n[ERROR: ${err.message}]`,
      });
    });
  });
}

async function main() {
  console.log("🚀 Credit Balance System - Complete Test Suite\n");
  console.log("=".repeat(70));
  console.log("This will run all tests for the credit balance system:");
  console.log("• Unit tests for calculation functions");
  console.log("• Integration tests with database operations");
  console.log("• Edge case validation");
  console.log("• Real-world scenario testing");
  console.log("=".repeat(70));

  const results: { suite: TestSuite; passed: boolean; output: string }[] = [];
  let totalPassed = 0;
  const totalSuites = testSuites.length;

  // Run each test suite
  for (const testSuite of testSuites) {
    try {
      const result = await runTestSuite(testSuite);
      results.push({
        suite: testSuite,
        passed: result.passed,
        output: result.output,
      });

      if (result.passed) {
        totalPassed++;
      }
    } catch (error) {
      console.error(`💥 Fatal error running ${testSuite.name}:`, error);
      results.push({
        suite: testSuite,
        passed: false,
        output: `Fatal error: ${error}`,
      });
    }

    console.log("=".repeat(70));
  }

  // Generate summary report
  console.log("\n📊 FINAL TEST REPORT");
  console.log("=".repeat(70));

  results.forEach((result, index) => {
    const status = result.passed ? "✅ PASSED" : "❌ FAILED";
    console.log(`${index + 1}. ${result.suite.name}: ${status}`);
    console.log(`   ${result.suite.description}`);
  });

  console.log("=".repeat(70));
  console.log(
    `\n🎯 Overall Results: ${totalPassed}/${totalSuites} test suites passed`
  );

  if (totalPassed === totalSuites) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("   🔥 The Credit Balance System is working correctly");
    console.log("   ✨ All calculations are accurate");
    console.log("   🚀 Database operations are functioning properly");
    console.log("   🛡️  Edge cases are handled gracefully");
    console.log("   📈 System is ready for production deployment");

    console.log("\n📋 Next Steps:");
    console.log("   1. Update UI components to display credit information");
    console.log("   2. Create admin dashboard for credit management");
    console.log("   3. Add monitoring and alerting for credit operations");
    console.log("   4. Update user documentation");
  } else {
    console.log("\n⚠️  SOME TESTS FAILED");
    console.log("   Please review the failed test output above");
    console.log("   Fix any issues before deploying to production");

    console.log("\n📋 Failed Test Suites:");
    results.forEach((result) => {
      if (!result.passed) {
        console.log(`   • ${result.suite.name}`);
      }
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log("Test execution completed");

  // Exit with appropriate code
  process.exit(totalPassed === totalSuites ? 0 : 1);
}

// Handle process signals
process.on("SIGINT", () => {
  console.log("\n\n🛑 Test execution interrupted by user");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 Test execution terminated");
  process.exit(1);
});

// Run the complete test suite
main().catch((error) => {
  console.error("💥 Fatal error in test runner:", error);
  process.exit(1);
});
