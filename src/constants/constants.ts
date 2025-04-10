import path from 'node:path';
import { format, subMonths } from 'date-fns';
import dotenv from 'dotenv';
import type OpenAI from 'openai';

dotenv.config();

export const emailUsername = process.env.EMAIL_USERNAME;
export const emailPassword = process.env.EMAIL_PASSWORD;
export const emailHost = process.env.EMAIL_HOST;
export const emailTarget = process.env.EMAIL_TARGET;
export const airAttachmentPassword = process.env.AIR_ATTACHMENT_PASSWORD;

export const fioToken = process.env.FIO_TOKEN;
// this filename can be anything, it is set on save and used for opening -> then the file is deleted
export const attachmentFileName = 'transactions.pdf';
export const attachmentFilePath = path.join('./src/attachments', attachmentFileName);

export const serviceAccountPath = path.resolve('./service-account.json');

export const openaiToken = process.env.OPENAI_TOKEN;
export const openaiModel: OpenAI.Chat.ChatModel = process.env.OPENAI_MODEL_PROD as OpenAI.Chat.ChatModel;

export const getOpenAIModel = () =>
  // this has to be dane like this, when this file imports are executed, env is not yet set
  process.env.NODE_ENV === 'development'
    ? (process.env.OPENAI_MODEL_DEV as OpenAI.Chat.ChatModel | undefined)
    : (process.env.OPENAI_MODEL_PROD as OpenAI.Chat.ChatModel | undefined);

export const getSheetId = () =>
  // this has to be dane like this, when this file imports are executed, env is not yet set
  process.env.NODE_ENV === 'development' ? process.env.GOOGLE_SHEET_ID_DEV : process.env.GOOGLE_SHEET_ID_PROD;

export const whitelistedAccounts = JSON.parse(process.env.WHITELISTED_ACCOUNTS ?? '[]');
export const whitelistedInvestmentKeywords = JSON.parse(process.env.WHITELISTED_INVESTMENT_KEYWORDS ?? '');

const getLastMonth = () => {
  const lastMonth = subMonths(new Date(), 1);
  return format(lastMonth, 'MM-yyyy');
};

// change this if you need check attachment filename differently
export const keywordForAttachmentCheck = getLastMonth();
