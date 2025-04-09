import {
  getSheetId,
  keywordForAttachmentCheck,
  whitelistedAccounts,
  whitelistedInvestmentKeywords,
} from './constants/_constants.mjs';
import { dataFederation } from './features/_dataFederation.mjs';
import { fetchEmailAttachment, markLastSeenEmailAsUnseen } from './features/_fetchEmailAttachement.mjs';
import { fetchFioTransactions } from './features/_fetchFioTransactions.mjs';
import { cleanupGoogleSheets, getExistingDataFromSheet, writeSheetBulk } from './features/_googleSheet.mjs';
import { labelTransactions } from './features/_labelTransactions.mjs';
import { parseAirTransactions } from './features/_parseAirTransactions.mjs';

export const mainFlow = async ({ withLabeling, environment, actions, cleanup }) => {
  process.env.NODE_ENV = environment || 'development';
  const sheetId = getSheetId();

  if (actions !== 'none') {
    try {
      let airTransactions;
      let fioTransactions;

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
      console.log(expenses);

      // fetch existing transactions from Google Sheets
      const existingExpenses = await getExistingDataFromSheet('expenses', sheetId);
      const existingIncomes = await getExistingDataFromSheet('incomes', sheetId);
      const existingInvestments = await getExistingDataFromSheet('investments', sheetId);

      const finalInvestments = [...investments, ...existingInvestments];

      let finalExpenses;
      let finalIncomes;

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
          data: finalIncomes,
          sheetName: 'incomes',
          sheetId,
        },
        {
          data: finalExpenses,
          sheetName: 'expenses',
          sheetId,
        },
        {
          data: finalInvestments,
          sheetName: 'investments',
          sheetId,
        },
      ]);

      console.log('🍻  Every action completed');
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

  // TODO: Refactor this part
  if (cleanup === 'all') {
    try {
      console.log(`🪣   Initializing cleanup: ${cleanup}`);
      await markLastSeenEmailAsUnseen();
      await cleanupGoogleSheets(sheetId);
      return;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  if (cleanup === 'mail') {
    try {
      console.log(`🪣   Initializing cleanup: ${cleanup}`);
      await markLastSeenEmailAsUnseen();
      return;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  if (cleanup === 'sheets') {
    console.log(`🪣   Initializing cleanup: ${cleanup}`);
    try {
      await cleanupGoogleSheets(sheetId);
      return;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
};
