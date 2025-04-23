import fs from 'node:fs';
import { serviceAccountPath } from '@constants';
import type { Transaction } from '@types';
import { format, subMonths } from 'date-fns';
import { google } from 'googleapis';

// Authenticate using the service account
export const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const sheets = google.sheets({
  version: 'v4',
  auth,
});

/**
 * Validates the configuration for Google Sheets operations.
 * Ensures that the service account file exists and contains all required properties.
 *
 * @param sheetId - The Google Spreadsheet ID.
 * @param serviceAccountPath - The path to the service account JSON file.
 * @throws Error If the service account file is missing or invalid, or if the sheet ID is not set.
 */
export const configurationCheck = (sheetId: string, serviceAccountPath: string) => {
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('❌  service-account.json file is missing. Please provide the file in the root folder.');
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  const requiredProperties = [
    'client_email',
    'client_id',
    'project_id',
    'auth_uri',
    'token_uri',
    'auth_provider_x509_cert_url',
    'private_key_id',
    'private_key',
    'type',
    'universe_domain',
    'client_x509_cert_url',
  ];

  for (const property of requiredProperties) {
    if (!serviceAccount[property]) {
      throw new Error(`❌  Missing property '${property}' in service-account.json file.`);
    }
  }

  if (!sheetId) {
    throw new Error('❌  Mandatory sheet ID is not set. Set it in .env file');
  }
};

/**
 * Clears all data from a specified sheet in a Google Spreadsheet.
 *
 * @param sheetName - The name of the sheet to clear (e.g., "expenses", "incomes").
 * @param sheetId - The Google Spreadsheet ID.
 * @throws Error If clearing the sheet data fails.
 */
export const clearSheetData = async (sheetName: string, sheetId: string) => {
  try {
    console.log(`🧼  Deleting data from ${sheetName} in Google Spreadsheet`);
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:F`,
    });
    console.log(`🎉  Data from ${sheetName} in Google Spreadsheet deleted`);
  } catch (error) {
    throw new Error(
      `❌  Error clearing data from Google Spreadsheet for sheet ${sheetName}: ${error.message}`,
      { cause: error },
    );
  }
};

/**
 * Fetches existing data from a specified sheet in a Google Spreadsheet.
 *
 * @param sheetName - The name of the sheet to fetch data from (e.g., "expenses", "incomes").
 * @param sheetId - The Google Spreadsheet ID.
 * @returns A promise that resolves to an array of transactions.
 * @throws Error If fetching data from the sheet fails.
 */
export const getExistingDataFromSheet = async (
  sheetName: string,
  sheetId: string,
): Promise<Transaction[]> => {
  configurationCheck(sheetId, serviceAccountPath);

  try {
    console.log(`🔭  Fetching previous transactions data for ${sheetName} from Google Spreadsheet...`);

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:F`,
    });

    const filteredValues: Transaction[] | undefined = data?.values?.filter((item) => item.length > 1);

    console.log(
      `🖨️   ${filteredValues?.length} transactions for ${sheetName} from Google Spreadsheet fetched`,
    );

    return filteredValues ?? [];
  } catch (error) {
    throw new Error(
      `❌  Error fetching data from Google Spreadsheet for sheet '${sheetName}': ${error.message}`,
      { cause: error },
    );
  }
};

/**
 * Writes transaction data to a specified Google Sheet.
 * This function performs the following operations:
 * 1. Validates the required configuration settings.
 * 2. Clears existing data from the target sheet.
 * 3. Writes the provided transaction data to the sheet.
 *
 * @param transactions - Array of transaction rows to write to the sheet.
 * @param sheetName - Name of the target Google Sheet (e.g., "expenses", "incomes").
 * @param sheetId - Google Spreadsheet ID where the sheet is located.
 * @throws Error If configuration is invalid, sheet clearing fails, or writing data fails.
 * @returns Promise<void> Resolves when data is successfully written.
 */
export const writeSheet = async (
  transactions: Transaction[],
  sheetName: string,
  sheetId: string,
): Promise<void> => {
  configurationCheck(sheetId, serviceAccountPath);
  await clearSheetData(sheetName, sheetId);

  try {
    console.log(`🖋   Writing ${sheetName} transactions data to Google Spreadsheet...`);

    const requestBody = {
      majorDimension: 'ROWS',
      values: transactions,
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody,
    });

    console.log(`📊  Data written to ${sheetName} in Google Spreadsheet`);
  } catch (error) {
    throw new Error(
      `❌  Error writing data to Google Spreadsheet for sheet '${sheetName}': ${error.message}`,
      { cause: error },
    );
  }
};

/**
 * Writes transaction data to multiple sheets in a Google Spreadsheet.
 *
 * @param config - Array of configuration objects, each containing:
 *   - `sheetName`: The name of the sheet.
 *   - `sheetId`: The Google Spreadsheet ID.
 *   - `transactions`: The transaction data to write.
 * @throws Error If writing data to any sheet fails.
 */
export const writeSheetBulk = async (
  config: { sheetName: string; sheetId: string; transactions: Transaction[] }[],
) => {
  try {
    await Promise.all(config.map((item) => writeSheet(item.transactions, item.sheetName, item.sheetId)));
  } catch (error) {
    throw new Error(`❌  Error writing bulk data to Google Spreadsheet: ${error.message}`, { cause: error });
  }
};

/**
 * Filters out transactions from the last month.
 *
 * @param sheetName - The name of the sheet being filtered.
 * @param transactions - Array of transactions to filter.
 * @returns An array of transactions excluding those from the last month.
 */
export const filterOutLastMonth = (sheetName: string, transactions: Transaction[]) => {
  console.log(`🧸  Filtering out last month transactions for ${sheetName}`);

  const lastMonth = format(subMonths(new Date(), 1), 'M');
  const regex = new RegExp(`^${lastMonth}/`);

  const filteredTransactions = transactions.filter((item) => !regex.test(item[2]));

  console.log(`💫  ${transactions.length - filteredTransactions.length} filtered out for ${sheetName}`);

  return filteredTransactions;
};

/**
 * Cleans up Google Sheets by removing last month's transactions from the specified sheets.
 * This function performs the following operations:
 * 1. Fetches existing data from the specified sheets (expenses, incomes, investments).
 * 2. Filters out transactions from the last month.
 * 3. Writes the filtered data back to the respective sheets.
 *
 * @param sheetId - Google Spreadsheet ID where the sheets are located.
 * @throws Error If an error occurs during cleanup.
 * @returns Promise<void> Resolves when cleanup is completed.
 */
export const cleanupGoogleSheets = async (sheetId: string): Promise<void> => {
  try {
    const existingExpenses = await getExistingDataFromSheet('expenses', sheetId);
    const existingIncomes = await getExistingDataFromSheet('incomes', sheetId);
    const existingInvestments = await getExistingDataFromSheet('investments', sheetId);

    const filteredExpenses = filterOutLastMonth('expenses', existingExpenses);
    const filteredIncomes = filterOutLastMonth('incomes', existingIncomes);
    const filteredInvestments = filterOutLastMonth('investments', existingInvestments);

    // Write data to all sheets
    await writeSheetBulk([
      {
        transactions: filteredIncomes,
        sheetName: 'incomes',
        sheetId,
      },
      {
        transactions: filteredExpenses,
        sheetName: 'expenses',
        sheetId,
      },
      {
        transactions: filteredInvestments,
        sheetName: 'investments',
        sheetId,
      },
    ]);

    console.log('🧹  Cleanup completed');
  } catch (error) {
    throw new Error(`❌  Error during cleanup (sheets): ${error.message}`, {
      cause: error,
    });
  }
};
