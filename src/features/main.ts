import {
  SHEET_NAMES,
  getSheetId,
  lastMonth,
  whitelistedAccounts,
  whitelistedInvestmentKeywords,
} from '@constants';
import {
  cleanupGoogleSheets,
  createEmailBody,
  dataFederation,
  fetchEmailAttachment,
  fetchFioTransactions,
  getExistingDataFromSheet,
  labelTransactionsWithRetry,
  parseAirTransactions,
  writeSheetBulk,
} from '@features';
import type { AppArguments, Transaction, TransactionObject } from '@types';
import { sortByDateDesc } from '@utils';
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
 * @param args.month - The month to process transactions for, in the format "MM-yyyy". Defaults to the last month if not provided.
 * @throws Error If any required configuration is missing or an operation fails.
 */
export const mainFlow = async ({
  withLabeling,
  environment,
  actions,
  cleanup,
  month,
}: Partial<Arguments<AppArguments>>) => {
  // Set the environment from args
  process.env.NODE_ENV = environment || 'development';
  console.log(`🦖  Environment: ${process.env.NODE_ENV}`);

  const sheetId = getSheetId();
  console.log(`💥  Google Sheets ID: ${sheetId}`);

  if (!sheetId) {
    throw new Error('❌  Google Sheets ID is not configured. Set it in .env file');
  }

  const targetMonth: string = month || lastMonth;
  if (actions) {
    try {
      let airTransactions: TransactionObject[] | undefined;
      let fioTransactions: TransactionObject[] | undefined;

      if (actions !== 'fio') {
        // Fetch AIR transactions PDF from email
        await fetchEmailAttachment(targetMonth);

        // Parse AIR transactions from PDF
        airTransactions = await parseAirTransactions();
      }

      if (actions !== 'mail') {
        // Fetch transactions from FIO API
        fioTransactions = await fetchFioTransactions(targetMonth);
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
      const existingExpenses = await getExistingDataFromSheet(SHEET_NAMES.EXPENSES, sheetId);
      const existingIncomes = await getExistingDataFromSheet(SHEET_NAMES.INCOMES, sheetId);
      const existingInvestments = await getExistingDataFromSheet(SHEET_NAMES.INVESTMENTS, sheetId);

      const finalInvestments = sortByDateDesc([...investments, ...existingInvestments]);

      let finalExpenses: Transaction[];
      let finalIncomes: Transaction[];

      if (withLabeling) {
        // Use LLM to label transactions with category identifiers
        const [labeledExpenses, labeledIncomes] = await Promise.all([
          labelTransactionsWithRetry(existingExpenses, expenses, SHEET_NAMES.EXPENSES),
          labelTransactionsWithRetry(existingIncomes, incomes, SHEET_NAMES.INCOMES),
        ]);

        finalExpenses = labeledExpenses;
        finalIncomes = labeledIncomes;
      } else {
        finalExpenses = sortByDateDesc([...expenses, ...existingExpenses]);
        finalIncomes = sortByDateDesc([...incomes, ...existingIncomes]);
      }

      // Write data to all sheets
      await writeSheetBulk([
        {
          transactions: finalIncomes,
          sheetName: SHEET_NAMES.INCOMES,
          sheetId,
        },
        {
          transactions: finalExpenses,
          sheetName: SHEET_NAMES.EXPENSES,
          sheetId,
        },
        {
          transactions: finalInvestments,
          sheetName: SHEET_NAMES.INVESTMENTS,
          sheetId,
        },
      ]);

      createEmailBody(expenses, incomes, investments, sheetId);

      console.log('🍻  Every action completed');

      // Exit if no cleanup is required
      !cleanup && process.exit(0);
    } catch (error) {
      // Reset email and Google Sheets on failure
      console.error(error);
      try {
        console.log('🧽  Something has failed, fallbacking to cleanup');
        await cleanupGoogleSheets(sheetId, targetMonth);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
      process.exit(1);
    }
  }

  try {
    console.log(`🧽  Initializing cleanup: ${cleanup}`);

    if (cleanup !== 'mail') {
      await cleanupGoogleSheets(sheetId, targetMonth);
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
