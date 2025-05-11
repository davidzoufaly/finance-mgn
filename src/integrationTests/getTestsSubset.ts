import type { IntegrationTestsArgv } from '@integrationTests';
import type { TestCase } from '@types';

/**
 * Filters test cases based on provided conditions.
 *
 * @param testCases - Array of test case objects to filter.
 * @param conditions - Conditions to filter the test cases.
 * @returns Filtered array of test cases that match the conditions.
 */
export const getTestsSubset = (testCases: TestCase[], conditions?: IntegrationTestsArgv): TestCase[] => {
  if (!conditions) return testCases;

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
