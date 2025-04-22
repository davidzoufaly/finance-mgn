import type { AppArguments } from '@types';
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';

export const appArguments = {
  environment: {
    alias: 'e',
    type: 'string' as const,
    description: 'Set the environment (development | production)',
    default: 'development',
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
    description: 'Specify action ETL should trigger (all | fio | mail | none)',
    default: undefined,
  },
  cleanup: {
    alias: 'c',
    type: 'string' as const,
    description: 'Reset mailbox after action (all | mail | sheets | none)',
    default: undefined,
  },
};

export const argv: Partial<Arguments<AppArguments>> = yargs(hideBin(process.argv))
  .options(appArguments)
  .parseSync();
