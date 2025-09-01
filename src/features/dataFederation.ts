import type { Transaction, TransactionObject } from '@types';
import { compareDesc, format, parse } from 'date-fns';

/**
 * Configuration object for data federation.
 */
export type Config = {
  /** Specifies the action to be performed (e.g., 'mail', 'fio'). */
  actions: string;
  /** List of whitelisted bank accounts to exclude from processing. */
  whitelistedAccounts: string[];
  /** List of keywords to identify investment-related transactions. */
  whitelistedInvestmentKeywords: string[];
};

/**
 * Federated data categorized into expenses, incomes, and investments.
 */
export type DataFederation = {
  /** Array of expense transactions. */
  expenses: Transaction[];
  /** Array of income transactions. */
  incomes: Transaction[];
  /** Array of investment transactions. */
  investments: Transaction[];
};

/**
 * Normalizes a value by converting it to a string.
 *
 * @param item - The value to normalize (string or number).
 * @returns The normalized value as a string.
 */
export const normalizeValue = (item: string | number): string => {
  if (typeof item === 'number') {
    return item.toString();
  }
  return item;
};

/**
 * Normalizes the date format of transactions.
 *
 * @param data - Array of transactions with optional string properties.
 * @returns A new array of transactions with normalized date formats.
 */
export const normalizeDates = (data: TransactionObject[]) =>
  data.map((item) => {
    // Regex to match timezone offsets (e.g., +0200)
    const regex = new RegExp(/([+-]\d{2})(\d{2})$/);

    if (regex.test(item.date)) {
      const fixedOffsetDate = item.date.replace(regex, '');
      const date = new Date(fixedOffsetDate);
      const formattedDate = format(date, 'MM/dd/yyyy');
      return { ...item, date: formattedDate };
    }

    const date = parse(item.date, 'dd.MM.yyyy', new Date());
    const formattedDate = format(date, 'MM/dd/yyyy');
    return { ...item, date: formattedDate };
  });

/**
 * Federates and processes data from multiple sources.
 *
 * @param config - Configuration object for data federation.
 * @param fioData - Array of transactions from the first data source.
 * @param airData - Array of transactions from the second data source.
 * @returns Federated data categorized into expenses, incomes, and investments.
 * @throws An error if required data is missing or invalid.
 */
export const dataFederation = (
  config: Config,
  fioData: TransactionObject[] = [],
  airData: TransactionObject[] = [],
): DataFederation => {
  const { actions, whitelistedAccounts, whitelistedInvestmentKeywords } = config;

  if (actions !== 'mail' && fioData.length === 0) {
    throw new Error('❌  Data federation is not possible: the first data source is missing.');
  }

  if (actions !== 'fio' && airData.length === 0) {
    throw new Error('❌  Data federation is not possible: the second data source is missing.');
  }

  console.log('🧹  Federating, sorting and cleaning the data...');

  const data = [...fioData, ...airData]
    // Remove transfers between whitelisted accounts
    .filter(({ bankAccount, label }) => {
      const isBankAccountSame = whitelistedAccounts.includes(bankAccount);
      const isBankAccountIncludedInLabel = whitelistedAccounts.some((i) =>
        label.replace(/\s/g, '').includes(i),
      );
      return !isBankAccountSame && !isBankAccountIncludedInLabel;
    });

  console.log(
    `😑  ${airData.length + fioData.length - data.length} transactions filtered out. Total transactions after filtering: ${data.length}`,
  );

  // Unify date format
  const unifiedDates = normalizeDates(data);
  const sortedDataDateDesc = unifiedDates.sort((a, b) => compareDesc(a.date, b.date));

  // Find positive values = incomes
  const incomes = sortedDataDateDesc
    .filter((item) => item.value > 0)
    .map((item) => Object.values(item).map((item) => normalizeValue(item)));

  // Make absolute value of expenses
  const expensesIncludingInvestments = sortedDataDateDesc
    .filter((item) => item.value < 0)
    .map((item) => ({
      ...item,
      value: Math.abs(item.value),
    }));

  const { expenses, investments } = expensesIncludingInvestments.reduce<{
    investments: Transaction[];
    expenses: Transaction[];
  }>(
    (acc, currVal) => {
      const isInvestmentKeywordMatching = whitelistedInvestmentKeywords.some((item) =>
        currVal.label?.includes(item),
      );

      const currentTransactionAsArray: Transaction = Object.values(currVal).map((item) =>
        normalizeValue(item),
      );

      if (isInvestmentKeywordMatching) {
        acc.investments.push(currentTransactionAsArray);
      } else {
        acc.expenses.push(currentTransactionAsArray);
      }

      return acc;
    },
    { investments: [], expenses: [] },
  );

  console.log(
    `✨  Data prepared: ${incomes.length} incomes, ${expenses.length} expenses, ${investments.length} investments`,
  );

  return {
    incomes,
    expenses,
    investments,
  };
};
