import { spawn } from "child_process";
import { hideBin } from "yargs/helpers";
import { integrationTestCases } from "./integrationTestCases.mjs";

const RESET_CASE = {
  id: 29,
  command: "yarn",
  args: ["start", "--environment=development", "--withLabeling=false", "--actions=none", "--cleanup=all"],
};

// Add a sleep function to wait between tests
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Filters test cases based on provided conditions
 * @param {Array<Object>} testCases - Array of test case objects
 * @param {Array<string>} conditions - Array of conditions to filter out
 * @returns {Array<Object>} Filtered array of test cases
 */
export const getTestsSubset = (testCases, conditions = []) => {
  if (!conditions.length) return testCases;

  let finalCases = testCases;

  for (let i = 0; i < conditions.length; i++) {
    finalCases = finalCases.filter((item) => {
      return item.args.includes(conditions[i]);
    });
  }
  return finalCases;
};

async function runTest({ id, command, args }) {
  return new Promise((resolve, reject) => {
    console.log(`\n_________________________________\n`);
    console.log(`\n🚀  Running Test Case ID: ${id}...\n`);

    const child = spawn(command, args, { stdio: ["inherit", "pipe", "pipe"] });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    let errorOutput = "";

    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", async (code) => {
      if (code === 0) {
        console.log(`\n✅  Test Case ${id} PASSED\n`);
        try {
          await runReset(); // Reset environment if test passes
          resolve();
        } catch (resetError) {
          reject(new Error(`Test passed but environment reset failed: ${resetError.message}`));
        }
      } else {
        const error = new Error(`Test Case ${id} FAILED (Exit Code: ${code})`);
        error.errorOutput = errorOutput;
        reject(error);
      }
    });
  });
}

async function runReset() {
  return new Promise((resolve, reject) => {
    console.log(`🔄  Resetting environment (Test Case ${RESET_CASE.id})...\n`);

    const child = spawn(RESET_CASE.command, RESET_CASE.args, { stdio: ["inherit", "pipe", "pipe"] });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on("close", (code) => {
      if (code === 0) {
        console.log("\n✅  Environment reset successfully\n");
        resolve();
      } else {
        reject(new Error(`❌  Environment reset FAILED (Exit Code: ${code})`));
      }
    });
  });
}

async function runAllTests(testCases) {
  const argArray = hideBin(process.argv);
  const finalTestCases = getTestsSubset(testCases, argArray);

  console.log(`\n🎃  Condition matching ${finalTestCases.length} tests`);

  let failedTests = [];
  let lastTestStartTime = 0;

  for (const testCase of finalTestCases) {
    const currentTime = Date.now();

    // If less than 30 seconds have passed since the last test started
    if (lastTestStartTime > 0) {
      const elapsedTime = currentTime - lastTestStartTime;
      const minimumGap = 30 * 1000; // 30 seconds in milliseconds

      if (elapsedTime < minimumGap) {
        const remainingTime = minimumGap - elapsedTime;
        console.log(
          `⏱️  Waiting ${Math.ceil(remainingTime / 1000)} seconds before next test because of FIO API throttling...`,
        );
        await sleep(remainingTime);
      }
    }

    // Record the start time of this test
    lastTestStartTime = Date.now();

    try {
      await runTest(testCase);
    } catch (error) {
      console.error(`❌  ${error.message}`);
      if (error.errorOutput) {
        console.error("❌  Errors:\n", error.errorOutput);
      }
      failedTests.push(testCase.id);
    }
  }

  console.log(`🏁  All  ${testCases} tests completed`);

  if (failedTests > 0) {
    console.error(`❌  ${failedTests.length} test(s) failed, ID: ${failedTests.join()}`);
    process.exit(1); // Exit with error code if any tests failed
  }
}

runAllTests(integrationTestCases);
