import { subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { fioToken } from "../constants/constants.mjs";

// returns last month in yyyy-MM-dd/yyyy-MM-dd format
const getLastMonthRange = () => {
  const lastMonth = subMonths(new Date(), 1);

  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);

  const formattedRange = `${format(lastMonthStart, "yyyy-MM-dd")}/${format(lastMonthEnd, "yyyy-MM-dd")}`;
  return formattedRange;
};

export const fetchFioTransactions = async (endpoint) => {
  if (!fioToken) {
    throw new Error(`❌  FIO token is not configured. Set it in .env`);
  }

  const lastMonth = getLastMonthRange();
  const url = endpoint ?? `https://fioapi.fio.cz/v1/rest/periods/${fioToken}/${lastMonth}/transactions.json`;

  try {
    console.log(`💰  Fetching transactions for ${lastMonth} from FIO banka...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`❌  HTTP error! Status: ${response.status} (API throtling, wait 30 seconds)`);
    }

    const data = await response.json();
    const trans = data.accountStatement.transactionList.transaction;

    const transactions = trans.map((item) => ({
      trailingSpace: "",
      value: item.column1.value,
      date: item.column0.value.replace("+0100", ""),
      source: "fio",
      // if contains bank account number -> return with bank id
      bankAccount: item?.column2?.value ? `${item?.column2?.value}/${item?.column3?.value}` : "",
      // add "komentář" and for incomes also add "zpráva pro příjemce"
      label: `${item?.column25?.value} ${item?.column1?.value > 0 ? (item?.column16?.value ?? "") : ""}`,
    }));

    console.log(`🤝  ${transactions.length} transactions fetched from FIO banka for ${lastMonth}...`);

    return transactions;
  } catch (error) {
    throw new Error(`❌  Error fetching transactions: ${error.message}`, { cause: error });
  }
};
