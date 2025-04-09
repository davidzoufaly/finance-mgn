import fs from 'node:fs';
import { format, subMonths } from 'date-fns';
import { google } from 'googleapis';
import { serviceAccountPath } from '../constants/_constants.mjs';

// authenticate using the service account
const auth = new google.auth.GoogleAuth({
  keyFile: './service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({
  version: 'v4',
  auth,
});

const configurationCheck = (sheetId, serviceAccountPath) => {
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

const clearSheetData = async (sheetName, sheetId) => {
  try {
    console.log(`🧼  Deleting data from ${sheetName} in Google Spreadsheet`);
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:F`,
    });
    console.log(`🎉  Data from ${sheetName} in Google Spreadsheet deleted`);
  } catch (error) {
    throw new Error(
      `❌  Error fetching data from Google Spreadsheet for sheet ${sheetName}: ${error.message}`,
      { cause: error },
    );
  }
};

export const getExistingDataFromSheet = async (sheetName, sheetId) => {
  configurationCheck(sheetId, serviceAccountPath);

  try {
    console.log(`🔭  Fetching previous transactions data for ${sheetName} from Google Spreadsheet...`);

    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A:F`,
    });

    const filteredValues = data?.values?.filter((item) => item.length > 1);

    console.log(`🖨️   ${filteredValues.length} ransactions for ${sheetName} from Google Spreadsheet fetched`);

    return filteredValues || [];
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
 * 1. Validates the required configuration settings
 * 2. Clears existing data from the target sheet
 * 3. Writes the provided transaction data to the sheet
 *
 * @param {Array<Array<string|number>>} transactions - Array of transaction rows to write to the sheet
 * @param {string} sheetName - Name of the target Google Sheet (e.g., "expenses", "incomes")
 * @param {string} sheetId - Google Spreadsheet ID where the sheet is located
 * @throws {Error} If configuration is invalid, sheet clearing fails, or writing data fails
 * @returns {Promise<void>} Resolves when data is successfully written
 */
export const writeSheet = async (transactions, sheetName, sheetId) => {
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

export const writeSheetBulk = async (config) => {
  try {
    await Promise.all(config.map((item) => writeSheet(item.data, item.sheetName, item.sheetId)));
  } catch (error) {
    throw new Error(`❌  Error writing bulk data to Google Spreadsheet: ${error.message}`, { cause: error });
  }
};

// helper function
const filterOutLastMonth = (sheetName, transactions) => {
  console.log(`🧸  Filtering out last month transactions for ${sheetName}`);

  const lastMonth = format(subMonths(new Date(), 1), 'M');
  const regex = new RegExp(`^${lastMonth}/`);

  const filteredTransactions = transactions.filter((item) => !regex.test(item[2]));

  console.log(`💫  ${transactions.length - filteredTransactions.length} filtered out for ${sheetName}`);

  return filteredTransactions;
};

export const cleanupGoogleSheets = async (sheetId) => {
  try {
    const existingExpenses = await getExistingDataFromSheet('expenses', sheetId);
    const existingIncomes = await getExistingDataFromSheet('incomes', sheetId);
    const existingInvestments = await getExistingDataFromSheet('investments', sheetId);

    const filteredExpenses = filterOutLastMonth('expenses', existingExpenses);
    const filteredIncomes = filterOutLastMonth('incomes', existingIncomes);
    const filteredInvestments = filterOutLastMonth('investments', existingInvestments);

    // write data to all sheets
    await writeSheetBulk([
      {
        data: filteredIncomes,
        sheetName: 'incomes',
        sheetId,
      },
      {
        data: filteredExpenses,
        sheetName: 'expenses',
        sheetId,
      },
      {
        data: filteredInvestments,
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
