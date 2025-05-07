import { appArguments } from '@constants';
import { integrationTestCases, runTests } from '@integrationTests';
import type { IntegrationTestsArgv } from '@integrationTests';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * Parses command-line arguments and runs the integration tests.
 */
export const testCaseArgv = yargs(hideBin(process.argv))
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
  .parseSync() as IntegrationTestsArgv;

runTests(integrationTestCases, testCaseArgv);
