import {
  getSheetId,
  keywordForAttachmentCheck,
  whitelistedAccounts,
  whitelistedInvestmentKeywords,
} from "./constants/constants.mjs";
import { dataFederation } from "./features/dataFederation.mjs";
import { fetchEmailAttachment, markLastSeenEmailAsUnseen } from "./features/fetchEmailAttachement.mjs";
import { fetchFioTransactions } from "./features/fetchFioTransactions.mjs";
import { getExistingDataFromSheet, writeSheetBulk, cleanupGoogleSheets } from "./features/googleSheet.mjs";
import { labelTransactions } from "./features/labelTransactions.mjs";
import { parseAirTransactions } from "./features/parseAirTransactions.mjs";

export const mainFlow = async ({ withLabeling, environment, actions, cleanup }) => {
  process.env.NODE_ENV = environment || "development";
  const sheetId = getSheetId();

  if (actions !== "none") {
    try {
      let airTransactions, fioTransactions;

      if (actions !== "fio") {
        // get AIR transactions PDF from Email
        await fetchEmailAttachment(keywordForAttachmentCheck);

        // get AIR transactions from PDF
        airTransactions = await parseAirTransactions();
      }

      if (actions !== "mail") {
        // get transactions from FIO API
        fioTransactions = await fetchFioTransactions();
      }

      // cleaning & grouping
      const { incomes, expenses, investments } = dataFederation(fioTransactions, airTransactions, {
        actions,
        whitelistedAccounts,
        whitelistedInvestmentKeywords,
      });

      // fetch existing transactions from Google Sheets
      const existingExpenses = await getExistingDataFromSheet("expenses", sheetId);
      const existingIncomes = await getExistingDataFromSheet("incomes", sheetId);
      const existingInvestments = await getExistingDataFromSheet("investments", sheetId);

      const finalInvestments = [...investments, ...existingInvestments];
      let finalExpenses, finalIncomes;

      if (withLabeling) {
        // use LLM to add label transactions with categories identifiers
        const [labeledExpenses, labeledIncomes] = await Promise.all([
          labelTransactions(existingExpenses, expenses, "expenses"),
          labelTransactions(existingIncomes, incomes, "incomes"),
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
          sheetName: "incomes",
          sheetId,
        },
        {
          data: finalExpenses,
          sheetName: "expenses",
          sheetId,
        },
        {
          data: finalInvestments,
          sheetName: "investments",
          sheetId,
        },
      ]);

      console.log("🍻  Every action completed");
    } catch (error) {
      // reset email and googlesheets on fail
      console.error(error);
      try {
        console.log("🪣   Something has failed, fallbacking to cleanup");
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
  if (cleanup === "all") {
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

  if (cleanup === "mail") {
    try {
      console.log(`🪣   Initializing cleanup: ${cleanup}`);
      await markLastSeenEmailAsUnseen();
      return;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  if (cleanup === "sheets") {
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
