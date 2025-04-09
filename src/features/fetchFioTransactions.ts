import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { fioToken } from "../constants";
import type { TransactionObjOptStr } from "../types";

type ColumnValueString = {
  value: string;
  name: string;
  id: number;
} | null;

type ColumnValueNumber = {
  value: number;
  name: string;
  id: number;
} | null;

type FioTransaction = {
  column0: ColumnValueString;
  column1: ColumnValueNumber;
  column2: ColumnValueString;
  column3: ColumnValueString;
  column4: ColumnValueString;
  column5: ColumnValueString;
  column6: ColumnValueString;
  column7: ColumnValueString;
  column8: ColumnValueString;
  column9: ColumnValueString;
  column10: ColumnValueString;
  column12: ColumnValueString;
  column14: ColumnValueString;
  column16: ColumnValueString;
  column17: ColumnValueString;
  column18: ColumnValueString;
  column22: ColumnValueString;
  column25: ColumnValueString;
  column26: ColumnValueString;
  column27: ColumnValueString;
};

type AccountStatement = {
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

// returns last month in yyyy-MM-dd/yyyy-MM-dd format
const getLastMonthRange = (): string => {
  const lastMonth = subMonths(new Date(), 1);

  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);

  const formattedRange = `${format(lastMonthStart, "yyyy-MM-dd")}/${format(lastMonthEnd, "yyyy-MM-dd")}`;
  return formattedRange;
};

export const fetchFioTransactions = async (endpoint?: string | undefined) => {
  if (!fioToken) {
    throw new Error("❌  FIO token is not configured. Set it in .env");
  }

  const lastMonth = getLastMonthRange();
  const url = endpoint ?? `https://fioapi.fio.cz/v1/rest/periods/${fioToken}/${lastMonth}/transactions.json`;

  try {
    console.log(`💰  Fetching transactions for ${lastMonth} from FIO banka...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`❌  HTTP error! Status: ${response.status} (API throtling, wait 30 seconds)`);
    }

    const data: AccountStatement = (await response.json()) as AccountStatement;
    const trans = data.accountStatement.transactionList.transaction;

    const transactions: TransactionObjOptStr[] = trans.map((item) => {
      const amount = item?.column1?.value ?? 0;
      const date = item?.column0?.value ?? "";
      const bankAccountNumber = item?.column2?.value ?? "";
      const bankCode = item?.column3?.value ?? "";
      const comment = item?.column25?.value ?? "";
      const recipientMessage = item?.column16?.value ?? "";

      const isIncome = typeof amount === "number" && amount > 0;
      // if contains bank account number -> return with bank id
      const bankAccount = bankAccountNumber ? `${bankAccountNumber}/${bankCode}` : "";
      // add "komentář" and for incomes also add "zpráva pro příjemce"
      const label = isIncome ? `${comment} ${recipientMessage}` : comment;

      return {
        trailingSpace: "",
        value: amount,
        date,
        source: "fio",
        bankAccount,
        label,
      };
    });

    console.log(`🤝  ${transactions.length} transactions fetched from FIO banka for ${lastMonth}...`);

    return transactions;
  } catch (error) {
    throw new Error(`❌  Error fetching transactions: ${error.message}`, {
      cause: error,
    });
  }
};
