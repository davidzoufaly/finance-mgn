import {
  getSheetId,
  keywordForAttachmentCheck,
  whitelistedAccounts,
  whitelistedInvestmentKeywords,
} from '@constants';
import {
  cleanupGoogleSheets,
  dataFederation,
  fetchEmailAttachment,
  fetchFioTransactions,
  getExistingDataFromSheet,
  labelTransactions,
  markLastSeenEmailAsUnseen,
  parseAirTransactions,
  writeSheetBulk,
} from '@features';
import type { AppArguments, Transaction, TransactionObject } from '@types';
import type { Arguments } from 'yargs';

/**
 * Main flow of the application.
 * This function orchestrates the entire process, including:
 * - Fetching transactions from email attachments and APIs.
 * - Cleaning and grouping transactions.
 * - Labeling transactions using an LLM (if enabled).
 * - Writing transactions to Google Sheets.
 * - Performing cleanup operations.
 *
 * @param args - The parsed command-line arguments.
 * @param args.withLabeling - Whether to use LLM for labeling transactions.
 * @param args.environment - The environment to run the application in (e.g., "development", "production").
 * @param args.actions - The actions to perform (e.g., "mail", "fio", or both).
 * @param args.cleanup - The cleanup mode (e.g., "sheets", "mail", or both).
 * @throws Error If any required configuration is missing or an operation fails.
 */
export const mainFlow = async ({
  withLabeling,
  environment,
  actions,
  cleanup,
}: Partial<Arguments<AppArguments>>) => {
  // Set the environment from args
  process.env.NODE_ENV = environment || 'development';
  console.log(`🦖  Environment: ${process.env.NODE_ENV}`);

  const sheetId = getSheetId();
  console.log(`💥  Google Sheets ID: ${sheetId}`);

  if (!sheetId) {
    throw new Error('❌  Google Sheets ID is not configured. Set it in .env file');
  }

  if (actions) {
    try {
      let airTransactions: TransactionObject[] | undefined;
      let fioTransactions: TransactionObject[] | undefined;

      if (actions !== 'fio') {
        // Fetch AIR transactions PDF from email
        await fetchEmailAttachment(keywordForAttachmentCheck);

        // Parse AIR transactions from PDF
        airTransactions = await parseAirTransactions();
      }

      if (actions !== 'mail') {
        // Fetch transactions from FIO API
        fioTransactions = await fetchFioTransactions();
      }

      // Clean and group transactions
      const { incomes, expenses, investments } = dataFederation(
        {
          actions,
          whitelistedAccounts,
          whitelistedInvestmentKeywords,
        },
        fioTransactions,
        airTransactions,
      );

      // Fetch existing transactions from Google Sheets
      const existingExpenses = await getExistingDataFromSheet('expenses', sheetId);
      const existingIncomes = await getExistingDataFromSheet('incomes', sheetId);
      const existingInvestments = await getExistingDataFromSheet('investments', sheetId);

      const finalInvestments = [...investments, ...existingInvestments];

      let finalExpenses: Transaction[];
      let finalIncomes: Transaction[];

      if (withLabeling) {
        // Use LLM to label transactions with category identifiers
        const [labeledExpenses, labeledIncomes] = await Promise.all([
          labelTransactions(existingExpenses, expenses, 'expenses'),
          labelTransactions(existingIncomes, incomes, 'incomes'),
        ]);

        finalExpenses = labeledExpenses;
        finalIncomes = labeledIncomes;
      } else {
        finalExpenses = [...expenses, ...existingExpenses];
        finalIncomes = [...incomes, ...existingIncomes];
      }

      // Write data to all sheets
      await writeSheetBulk([
        {
          transactions: finalIncomes,
          sheetName: 'incomes',
          sheetId,
        },
        {
          transactions: finalExpenses,
          sheetName: 'expenses',
          sheetId,
        },
        {
          transactions: finalInvestments,
          sheetName: 'investments',
          sheetId,
        },
      ]);
      console.log('🍻  Every action completed');

      // Exit if no cleanup is required
      !cleanup && process.exit(0);
    } catch (error) {
      // Reset email and Google Sheets on failure
      console.error(error);
      try {
        console.log('🪣   Something has failed, fallbacking to cleanup');
        await markLastSeenEmailAsUnseen();
        await cleanupGoogleSheets(sheetId);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
      process.exit(1);
    }
  }

  try {
    console.log(`🪣   Initializing cleanup: ${cleanup}`);
    if (cleanup !== 'sheets') {
      await markLastSeenEmailAsUnseen();
    }

    if (cleanup !== 'mail') {
      await cleanupGoogleSheets(sheetId);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
