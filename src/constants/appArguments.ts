import type { AppArguments } from '@types';
import yargs from 'yargs';
import type { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * Command-line arguments configuration for the application.
 */
export const appArguments = {
  /**
   * Specifies the environment in which the application will run.
   *
   * @alias e
   * @type string
   * @default "development"
   * @choices "development", "production"
   */
  environment: {
    alias: 'e',
    type: 'string' as const,
    description: 'Set the environment',
    default: 'development',
    choices: ['development', 'production'],
  },

  /**
   * Enables or disables transaction labeling using the LLM.
   *
   * @alias l
   * @type boolean
   * @default undefined
   */
  withLabeling: {
    alias: 'l',
    type: 'boolean' as const,
    description: 'Enable or disable transaction labeling',
    default: undefined,
  },

  /**
   * Specifies the action(s) the ETL process should trigger.
   *
   * @alias a
   * @type string
   * @default undefined
   * @choices "all", "fio", "mail"
   */
  actions: {
    alias: 'a',
    type: 'string' as const,
    description: 'Specify action ETL should trigger',
    default: undefined,
    choices: ['all', 'fio', 'mail'],
  },

  /**
   * Specifies the cleanup mode for the application.
   *
   * @alias c
   * @type string
   * @default undefined
   * @choices "all", "mail", "sheets"
   */
  cleanup: {
    alias: 'c',
    type: 'string' as const,
    description: 'Reset mailbox after action',
    choices: ['all', 'mail', 'sheets'],
    default: undefined,
  },
};

/**
 * Parses and validates the command-line arguments using yargs.
 *
 * @returns The parsed command-line arguments as an `Arguments<AppArguments>` object.
 */
export const argv = yargs(hideBin(process.argv)).options(appArguments).parseSync() as Arguments<AppArguments>;
