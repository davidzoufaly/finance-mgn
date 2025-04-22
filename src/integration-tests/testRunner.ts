import { spawn } from 'child_process';
import { appArguments } from '@constants';
import { integrationTestCases } from '@integrationTests';
import type { AppArguments } from '@types';
import type { Arguments } from 'yargs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

type IntegrationTestsArguments = AppArguments & { id: number[] };

type TestCase = {
  id: number;
  environment: string;
  withLabeling: boolean;
  actions: string;
  cleanup: string;
};

type IntegrationTestsArgv = Partial<Arguments<IntegrationTestsArguments>>;

const RESET_CASE = integrationTestCases.find((item) => item.id === 25) as TestCase;

/**
 * Sleeps for a specified amount of time.
 *
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified time.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Filters test cases based on provided conditions.
 *
 * @param testCases - Array of test case objects to filter.
 * @param conditions - Conditions to filter the test cases.
 * @returns Filtered array of test cases that match the conditions.
 */
export const getTestsSubset = (testCases: TestCase[], conditions?: IntegrationTestsArgv): TestCase[] => {
  if (!conditions) return testCases;

  // Extracted as a separate variable to avoid TypeScript errors when directly using conditions.id
  const ids = conditions.id;
  if (ids && ids.length > 0) {
    return testCases.filter((item) => ids.some((id) => id === item.id)) as TestCase[];
  }

  return testCases.filter((testCase) => {
    const matchesEnvironment = conditions.environment === testCase.environment;
    const matchesWithLabeling =
      conditions.withLabeling === undefined || conditions.withLabeling === testCase.withLabeling;
    const matchesActions = conditions.actions === undefined || conditions.actions === testCase.actions;
    const matchesCleanup = conditions.cleanup === undefined || conditions.cleanup === testCase.cleanup;

    return matchesEnvironment && matchesWithLabeling && matchesActions && matchesCleanup;
  });
};

/**
 * Runs a single test case.
 *
 * @param testCase - The test case to run.
 * @returns A promise that resolves to `true` if the test passes, or rejects with an error if it fails.
 */
const runTest = async (testCase: TestCase): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀  Running Test Case ID: ${testCase.id}...\n`);

    const argv = [
      '--withLabeling',
      testCase.withLabeling.toString(),
      '--environment',
      testCase.environment,
      '--actions',
      testCase.actions,
      '--cleanup',
      testCase.cleanup,
    ];

    const child = spawn('yarn', ['start', ...argv], { stdio: ['inherit', 'pipe', 'pipe'] });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    let errorOutput = '';

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅  Test Case ${testCase.id} passed\n`);
        resolve(true);
      } else {
        const error = new Error(`Test Case ${testCase.id} failed (Exit Code: ${code})`);
        errorOutput += error.message;
        console.error('❌  Errors:\n', errorOutput);
        reject(error);
      }
    });
  });
};

/**
 * Resets the environment by running a specific reset test case.
 *
 * @param resetCase - The test case to use for resetting the environment.
 * @returns A promise that resolves when the reset is successful, or logs an error if it fails.
 */
const runReset = async (resetCase: TestCase): Promise<void> => {
  console.log(`🔄  Resetting environment (Test Case ${resetCase.id})...\n`);
  try {
    await runTest(resetCase);
    console.log('🕹️  Environment reset successfully\n');
  } catch (error) {
    console.error(`❌  Environment reset failed for Test Case ${resetCase.id}: ${error.message}`);
  }
};

/**
 * Runs a series of test cases based on the provided arguments.
 *
 * @param testCases - Array of test cases to run.
 * @param argv - Parsed command-line arguments specifying conditions for running tests.
 * @returns A promise that resolves when all tests have been executed.
 */
const runTests = async (testCases: TestCase[], argv: IntegrationTestsArgv): Promise<void> => {
  const finalTestCases = getTestsSubset(testCases, argv);
  console.log(`\n🎃  Condition matching ${finalTestCases.length} tests`);

  const failedTests: number[] = [];
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
          `⏱️  Waiting ${Math.ceil(
            remainingTime / 1000,
          )} seconds before next test because of FIO API throttling...`,
        );
        await sleep(remainingTime);
      }
    }

    // Record the start time of this test
    lastTestStartTime = Date.now();

    try {
      const success = await runTest(testCase);
      if (success) {
        await runReset(RESET_CASE);
      }
    } catch (error) {
      console.error(`❌  ${error.message}`);
      failedTests.push(testCase.id);
    }
  }

  const testsIds = finalTestCases.map((item) => item.id);
  const passedTests = testsIds.filter((item) => !failedTests.includes(item));

  if (failedTests.length > 0) {
    console.error(
      `❌  ${failedTests.length} test(s) failed, ID: ${failedTests.join()}. ${testsIds.length - failedTests.length} test(s) passed, ID: ${passedTests.join()}`,
    );
    process.exit(1); // Exit with error code if any tests failed
  } else {
    console.log(`🏁  ${testsIds.length} test(s) completed successfully, ID: ${testsIds.join()}`);
  }
};

/**
 * Parses command-line arguments and runs the integration tests.
 */
const testCaseArgv: IntegrationTestsArgv = yargs(hideBin(process.argv))
  .options({
    ...appArguments,
    id: {
      alias: 'i',
      type: 'array' as const,
      description: 'Provide test case IDs to run',
      default: [],
      coerce: (ids) => ids.map((id: string | number) => Number(id)),
    },
  })
  .parseSync();

runTests(integrationTestCases, testCaseArgv);
