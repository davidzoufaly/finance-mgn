import dotenv from "dotenv";
import path from "path";
import { subMonths, format } from "date-fns";

dotenv.config();

export const emailUsername = process.env.EMAIL_USERNAME;
export const emailPassword = process.env.EMAIL_PASSWORD;
export const emailHost = process.env.EMAIL_HOST;
export const emailTarget = process.env.EMAIL_TARGET;
export const airAttachmentPassword = process.env.AIR_ATTACHMENT_PASSWORD;

export const fioToken = process.env.FIO_TOKEN;
// this filename can be anything, it is set on save and used for opening -> then the file is deleted
export const attachmentFileName = "transactions.pdf";
export const attachmentFilePath = path.join("./src/attachments", attachmentFileName);

export const serviceAccountPath = path.resolve("./service-account.json");

export const openaiToken = process.env.OPENAI_TOKEN;

export const getSheetId = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? process.env.GOOGLE_SHEET_ID_DEV
    : process.env.GOOGLE_SHEET_ID_PROD;

export const whitelistedAccounts = JSON.parse(process.env.WHITELISTED_ACCOUNTS || "[]");
export const whitelistedInvestmentKeywords = JSON.parse(process.env.WHITELISTED_INVESTMENT_KEYWORDS);

const getLastMonth = () => {
  const lastMonth = subMonths(new Date(), 1);
  return format(lastMonth, "MM-yyyy");
};

// change this if you need check attachment filename differently
export const keywordForAttachmentCheck = getLastMonth();
