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
import type { AppArguments, Transaction, TransactionObjOptStr, TransactionObject } from '@types';
import type { Arguments } from 'yargs';

export const mainFlow = async ({
  withLabeling,
  environment,
  actions,
  cleanup,
}: Partial<Arguments<AppArguments>>) => {
  // need to set environment from args
  process.env.NODE_ENV = environment || 'development';

  const sheetId = getSheetId();

  if (!sheetId) {
    throw new Error('❌  Google Sheets ID is not configured. Set it in .env file');
  }

  if (actions) {
    try {
      let airTransactions: TransactionObject[] | undefined;
      let fioTransactions: TransactionObjOptStr[] | undefined;

      if (actions !== 'fio') {
        // get AIR transactions PDF from Email
        await fetchEmailAttachment(keywordForAttachmentCheck);

        // get AIR transactions from PDF
        airTransactions = await parseAirTransactions();
      }

      if (actions !== 'mail') {
        // get transactions from FIO API
        fioTransactions = await fetchFioTransactions();
      }

      // cleaning & grouping
      const { incomes, expenses, investments } = dataFederation(
        {
          actions,
          whitelistedAccounts,
          whitelistedInvestmentKeywords,
        },
        fioTransactions,
        airTransactions,
      );

      // fetch existing transactions from Google Sheets
      const existingExpenses = await getExistingDataFromSheet('expenses', sheetId);

      const existingIncomes = await getExistingDataFromSheet('incomes', sheetId);
      const existingInvestments = await getExistingDataFromSheet('investments', sheetId);

      const finalInvestments = [...investments, ...existingInvestments];

      let finalExpenses: Transaction[];
      let finalIncomes: Transaction[];

      if (withLabeling) {
        // use LLM to add label transactions with categories identifiers
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

      // write data to all sheets
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

      !cleanup && process.exit(0);
    } catch (error) {
      // reset email and googlesheets on fail
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
