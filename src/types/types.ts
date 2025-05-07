export type TransactionObject = {
  trailingSpace: string;
  value: number;
  date: string;
  source: string;
  bankAccount: string;
  label: string;
};

export type ChangeSomeKeys<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? string : T[P];
};

export type TransactionObjOptStr = ChangeSomeKeys<TransactionObject, 'value'>;

export type Transaction = string[];

export type ValueOf<T> = T[keyof T][];
export type TransactionValue = ValueOf<TransactionObject>;

export type AppArguments = {
  environment: 'development' | 'production';
  withLabeling?: boolean | undefined;
  actions?: 'fio' | 'mail' | 'all' | undefined;
  cleanup?: 'mail' | 'sheets' | 'all' | undefined;
};

export type IntegrationTestsArguments = AppArguments & { id?: number[] };
export type TestCase = AppArguments & { id: number };
