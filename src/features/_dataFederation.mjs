import { compareDesc, format, parse } from 'date-fns';

const normalizeDates = (data) =>
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

export const dataFederation = (config, fioData = [], airData = []) => {
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
    .filter((item) => {
      const isBankAccountSame = whitelistedAccounts.includes(item.bankAccount);
      const isBankAccountIncludedInLabel = whitelistedAccounts.some((i) =>
        item.label?.replace(/\s/g, '').includes(i),
      );
      return !isBankAccountSame && !isBankAccountIncludedInLabel;
    });

  // unify date format
  const unifiedDates = normalizeDates(data);
  const sortedDataDateDesc = unifiedDates.sort((a, b) => compareDesc(a.date, b.date));

  // find positive values = incomes
  const incomes = sortedDataDateDesc.filter((item) => item.value > 0).map((item) => Object.values(item));

  // make absolute value of expenses
  const expensesIncludingInvestments = sortedDataDateDesc
    .filter((item) => item.value < 0)
    .map((item) => ({
      ...item,
      value: Math.abs(item.value),
    }));

  const { expenses, investments } = expensesIncludingInvestments.reduce(
    (acc, currVal) =>
      whitelistedInvestmentKeywords.some((item) => currVal.label?.includes(item))
        ? { ...acc, investments: [...acc.investments, Object.values(currVal)] }
        : { ...acc, expenses: [...acc.expenses, Object.values(currVal)] },
    { investments: [], expenses: [] },
  );

  console.log('✨  Data prepared');

  return {
    incomes,
    expenses,
    investments,
  };
};
