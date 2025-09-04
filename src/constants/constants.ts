import path from 'node:path';
import { format, subMonths } from 'date-fns';
import dotenv from 'dotenv';
import type OpenAI from 'openai';

dotenv.config();

/**
 * Email username for IMAP authentication.
 * @default process.env.EMAIL_USERNAME
 */
export const emailUsername = process.env.EMAIL_USERNAME;

/**
 * Email password for IMAP authentication.
 * @default process.env.EMAIL_PASSWORD
 */
export const emailPassword = process.env.EMAIL_PASSWORD;

/**
 * Email host for IMAP server.
 * @default process.env.EMAIL_IMAP_SERVER
 */
export const emailImapServer = process.env.EMAIL_IMAP_SERVER;

/**
 * Email port for IMAP server.
 * @default process.env.EMAIL_IMAP_PORT
 */
export const emailImapPort = process.env.EMAIL_IMAP_PORT;

/**
 * Target email address to fetch attachments from.
 * @default process.env.EMAIL_TRANSACTIONS_TARGET
 */
export const emailTransactionsTarget = process.env.EMAIL_TRANSACTIONS_TARGET;

/**
 * Password for decrypting AIR bank PDF attachments.
 * @default process.env.AIR_ATTACHMENT_PASSWORD
 */
export const airAttachmentPassword = process.env.AIR_ATTACHMENT_PASSWORD;

/**
 * API token for accessing the FIO bank API.
 * @default process.env.FIO_TOKEN
 */
export const fioToken = process.env.FIO_TOKEN;

/**
 * Filename for the downloaded email attachment.
 * This filename is used for saving and opening the file, and it is deleted after processing.
 * @default 'transactions.pdf'
 */
export const attachmentFileName = 'transactions.pdf';

/**
 * File path for the downloaded email attachment.
 * Combines the attachment directory with the filename.
 */
export const attachmentFilePath = path.join('./src/attachments', attachmentFileName);

/**
 * Path to the Google service account JSON file.
 * @default './service-account.json'
 */
export const serviceAccountPath = path.resolve('./service-account.json');

/**
 * OpenAI API token for accessing the OpenAI API.
 * @default process.env.OPENAI_TOKEN
 */
export const openaiToken = process.env.OPENAI_TOKEN;

/**
 * OpenAI model to use in production.
 * @default process.env.OPENAI_MODEL_PROD
 */
export const openaiModel: OpenAI.Chat.ChatModel = process.env.OPENAI_MODEL_PROD as OpenAI.Chat.ChatModel;

/**
 * Retrieves the appropriate OpenAI model based on the current environment.
 * - Uses `OPENAI_MODEL_DEV` in development.
 * - Uses `OPENAI_MODEL_PROD` in production.
 *
 * @returns The OpenAI model to use, or `undefined` if not set.
 */
export const getOpenAIModel = () =>
  process.env.NODE_ENV === 'development'
    ? (process.env.OPENAI_MODEL_DEV as OpenAI.Chat.ChatModel | undefined)
    : (process.env.OPENAI_MODEL_PROD as OpenAI.Chat.ChatModel | undefined);

/**
 * Retrieves the appropriate Google Sheet ID based on the current environment.
 * - Uses `GOOGLE_SHEET_ID_DEV` in development.
 * - Uses `GOOGLE_SHEET_ID_PROD` in production.
 *
 * @returns The Google Sheet ID to use, or `undefined` if not set.
 */
export const getSheetId = () =>
  process.env.NODE_ENV === 'development' ? process.env.GOOGLE_SHEET_ID_DEV : process.env.GOOGLE_SHEET_ID_PROD;

/**
 * List of whitelisted bank accounts to exclude from processing.
 * Parsed from the `WHITELISTED_ACCOUNTS` environment variable.
 * @default []
 */
export const whitelistedAccounts = JSON.parse(process.env.WHITELISTED_ACCOUNTS ?? '[]');

/**
 * List of keywords to identify investment-related transactions.
 * Parsed from the `WHITELISTED_INVESTMENT_KEYWORDS` environment variable.
 * @default []
 */
export const whitelistedInvestmentKeywords = JSON.parse(process.env.WHITELISTED_INVESTMENT_KEYWORDS ?? '[]');

/**
 * Retrieves the last month in the format `MM-yyyy`.
 *
 * @returns The last month as a string (e.g., "03-2025").
 */
export const getLastMonth = () => {
  const lastMonth = subMonths(new Date(), 1);
  return format(lastMonth, 'MM-yyyy');
};

/**
 * Keyword used to check attachment filenames.
 * Defaults to the last month in the format `MM-yyyy`.
 * @default getLastMonth()
 */
export const lastMonth = getLastMonth();

/**
 * Names of the Google Sheets used in the application.
 */
export const SHEET_NAMES = {
  EXPENSES: 'expenses',
  INCOMES: 'incomes',
  INVESTMENTS: 'investments',
};
