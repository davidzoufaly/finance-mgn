import { parse, format, compareDesc } from "date-fns";

const normalizeDates = (data) => {
  return data.map((item) => {
    // try parsing using different known formats
    let parsedDate;

    parsedDate = parse(item.date, "yyyy-MM-dd", new Date());

    parsedDate = isNaN(parsedDate) ? parse(item.date, "dd.MM.yyyy", new Date()) : parsedDate;

    // format to desired output (dd.MM.yyyy)
    const formattedDate = format(parsedDate, "MM/dd/yyyy");

    return { ...item, date: formattedDate };
  });
};

export const dataFederation = (fioData = [], airData = [], config) => {
  const { actions, whitelistedAccounts, whitelistedInvestmentKeywords } = config;

  if (actions !== "mail" && fioData.length === 0) {
    throw new Error("❌  Data federation is not possible: the first data source is missing.");
  }

  if (actions !== "fio" && airData.length === 0) {
    throw new Error("❌  Data federation is not possible: the second data source is missing.");
  }

  console.log("🧹  Federating, sorting and cleaning the data...");

  const data = [...fioData, ...airData]
    // remove transfers between whitelisted accounts
    .filter((item) => {
      const isBankAccountSame = whitelistedAccounts.includes(item.bankAccount);
      const isBankAccountIncludedInLabel = whitelistedAccounts.some((i) =>
        item.label?.replace(/\s/g, "").includes(i),
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

  console.log("✨  Data prepared");

  return {
    incomes,
    expenses,
    investments,
  };
};
