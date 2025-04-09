import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { mainFlow } from './_mainFlow.mjs';

export const argv = yargs(hideBin(process.argv))
  .option('environment', {
    alias: 'e',
    type: 'string',
    description: 'Set the environment (development | production)',
    default: 'development',
  })
  .option('withLabeling', {
    alias: 'l',
    type: 'boolean',
    description: 'Enable or disable transaction labeling',
    default: true,
  })
  .option('actions', {
    alias: 'a',
    type: 'string',
    description: 'Specify action ETL should trigger (all | fio | mail | none)',
    default: 'all',
  })
  .option('cleanup', {
    alias: 'c',
    type: 'string',
    description: 'Reset mailbox after action (all | mail | sheets | none)',
    default: 'none',
  }).argv;

mainFlow(argv);
