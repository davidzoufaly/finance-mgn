import { compareDesc, format, parse } from 'date-fns';
import type { Transaction, TransactionObjOptStr, TransactionObject } from '../types';

type Config = {
  actions: string;
  whitelistedAccounts: string[];
  whitelistedInvestmentKeywords: string[];
};

const normalizeValue = (item: string | number): string => {
  if (typeof item === 'number') {
    return item.toString();
  }
  return item;
};

const normalizeDates = (data: TransactionObjOptStr[]) =>
  data.map((item) => {
    // e.g. 2025-03-31+0200
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

export const dataFederation = (
  config: Config,
  fioData: TransactionObjOptStr[] = [],
  airData: TransactionObject[] = [],
): {
  expenses: Transaction[];
  incomes: Transaction[];
  investments: Transaction[];
} => {
  const { actions, whitelistedAccounts, whitelistedInvestmentKeywords } = config;

  if (actions !== 'mail' && fioData.length === 0) {
    throw new Error('❌  Data federation is not possible: the first data source is missing.');
  }

  if (actions !== 'fio' && airData.length === 0) {
    throw new Error('❌  Data federation is not possible: the second data source is missing.');
  }

  console.log('🧹  Federating, sorting and cleaning the data...');

  const data = [...fioData, ...airData]
    // remove transfers between whitelisted accounts
    .filter(({ bankAccount, label }) => {
      const isBankAccountSame = whitelistedAccounts.includes(bankAccount);
      const isBankAccountIncludedInLabel = whitelistedAccounts.some((i) =>
        label.replace(/\s/g, '').includes(i),
      );
      return !isBankAccountSame && !isBankAccountIncludedInLabel;
    });

  // unify date format
  const unifiedDates = normalizeDates(data);
  const sortedDataDateDesc = unifiedDates.sort((a, b) => compareDesc(a.date, b.date));

  // find positive values = incomes
  const incomes = sortedDataDateDesc
    .filter((item) => item.value > 0)
    .map((item) => Object.values(item).map((item) => normalizeValue(item)));

  // make absolute value of expenses
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

  console.log('✨  Data prepared');

  return {
    incomes,
    expenses,
    investments,
  };
};
