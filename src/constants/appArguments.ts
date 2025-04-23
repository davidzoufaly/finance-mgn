import type { AppArguments } from '@types';
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';

export const appArguments = {
  environment: {
    alias: 'e',
    type: 'string' as const,
    description: 'Set the environment',
    default: 'development',
    choices: ['development', 'production'],
  },
  withLabeling: {
    alias: 'l',
    type: 'boolean' as const,
    description: 'Enable or disable transaction labeling',
    default: undefined,
  },
  actions: {
    alias: 'a',
    type: 'string' as const,
    description: 'Specify action ETL should trigger',
    default: undefined,
    choices: ['all', 'fio', 'mail'],
  },
  cleanup: {
    alias: 'c',
    type: 'string' as const,
    description: 'Reset mailbox after action',
    choices: ['all', 'mail', 'sheets'],
    default: undefined,
  },
};

export const argv = yargs(hideBin(process.argv)).options(appArguments).parseSync() as Arguments<AppArguments>;
