import { fioToken } from '@constants';
import type { TransactionObject } from '@types';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

/**
 * Represents a column value that is a string.
 */
export type ColumnValueString = {
  value: string;
  name: string;
  id: number;
} | null;

/**
 * Represents a column value that is a number.
 */
export type ColumnValueNumber = {
  value: number;
  name: string;
  id: number;
} | null;

/**
 * Represents a single transaction from the FIO API.
 */
export type FioTransaction = {
  column0: ColumnValueString; // Date of the transaction
  column1: ColumnValueNumber; // Amount of the transaction
  column2: ColumnValueString; // Bank account number
  column3: ColumnValueString; // Bank code
  column4: ColumnValueString;
  column5: ColumnValueString;
  column6: ColumnValueString;
  column7: ColumnValueString;
  column8: ColumnValueString;
  column9: ColumnValueString;
  column10: ColumnValueString;
  column12: ColumnValueString;
  column14: ColumnValueString;
  column16: ColumnValueString; // Recipient message
  column17: ColumnValueString;
  column18: ColumnValueString;
  column22: ColumnValueString;
  column25: ColumnValueString; // Comment
  column26: ColumnValueString;
  column27: ColumnValueString;
};

/**
 * Represents the account statement returned by the FIO API.
 */
export type AccountStatement = {
  accountStatement: {
    info: {
      accountId: string;
      bankId: string;
      currency: string;
      iban: string;
      bic: string;
      openingBalance: number;
      closingBalance: number;
      dateStart: string;
      dateEnd: string;
      yearList: null | string[];
      idList: null | number[];
      idFrom: number;
      idTo: number;
      idLastDownload: number | null;
    };
    transactionList: {
      transaction: FioTransaction[];
    };
  };
};

/**
 * Returns the date range for a given month in the format `yyyy-MM-dd/yyyy-MM-dd`.
 * If no month is provided, defaults to the last month.
 *
 * @param month - Optional month in the format 'MM/yyyy'.
 * @returns The date range for the specified or last month.
 */
export const getMonthRange = (month?: string): string => {
  let targetDate: Date;

  if (month) {
    // Parse month in MM/yyyy format
    const [mm, yyyy] = month.split('-');
    targetDate = new Date(Number(yyyy), Number(mm) - 1, 1);
  } else {
    targetDate = subMonths(new Date(), 1);
  }

  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  return `${format(monthStart, 'yyyy-MM-dd')}/${format(monthEnd, 'yyyy-MM-dd')}`;
};

/**
 * Fetches transactions from the FIO API for the last month or a custom endpoint.
 *
 * @param endpoint - Optional custom endpoint for fetching transactions.
 * @param month - Optional month in the format 'MM-yyyy' to fetch transactions for a specific month.
 * @returns A promise that resolves to an array of transactions in the `TransactionObjOptStr` format.
 * @throws An error if the FIO token is not configured or if the API request fails.
 */
export const fetchFioTransactions = async (
  endpoint?: string | undefined,
  month?: string,
): Promise<TransactionObject[]> => {
  if (!fioToken) {
    throw new Error('❌  FIO token is not configured. Set it in .env');
  }

  const monthRange = getMonthRange(month);
  const url = endpoint ?? `https://fioapi.fio.cz/v1/rest/periods/${fioToken}/${monthRange}/transactions.json`;

  try {
    console.log(`💰  Fetching transactions for ${monthRange} from FIO banka...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`❌  HTTP error! Status: ${response.status} (API throttling, wait 30 seconds)`);
    }

    const data: AccountStatement = (await response.json()) as AccountStatement;
    const trans = data.accountStatement.transactionList.transaction;

    const transactions: TransactionObject[] = trans.map((item) => {
      const amount = item?.column1?.value ?? 0;
      const date = item?.column0?.value ?? '';
      const bankAccountNumber = item?.column2?.value ?? '';
      const bankCode = item?.column3?.value ?? '';
      const comment = item?.column25?.value ?? '';
      const recipientMessage = item?.column16?.value ?? '';

      const isIncome = amount > 0;
      // If contains bank account number -> return with bank ID
      const bankAccount = bankAccountNumber ? `${bankAccountNumber}/${bankCode}` : '';
      // Add "comment" and for incomes also add "recipient message"
      const label = isIncome ? `${comment} ${recipientMessage}` : comment;

      return {
        trailingSpace: '',
        value: amount,
        date,
        source: 'fio',
        bankAccount,
        label,
      };
    });

    console.log(`🤝  ${transactions.length} transactions fetched from FIO banka for ${monthRange}...`);

    return transactions;
  } catch (error) {
    throw new Error(`❌  Error fetching transactions: ${error.message}`, {
      cause: error,
    });
  }
};
