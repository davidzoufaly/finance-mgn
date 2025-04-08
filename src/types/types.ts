export type TransactionObject = {
  trailingSpace: string
  value: number
  date: string
  source: string
  bankAccount: string
  label: string
}

type ChangeSomeKeys<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? number : T[P]
}

export type TransactionObjOptStr = ChangeSomeKeys<TransactionObject, 'value'>

export type Transaction = string[]

type ValueOf<T> = T[keyof T][]
export type TransactionValue = ValueOf<TransactionObject>

export type MainFlowConfig = {
  withLabeling: boolean
  environment: string
  actions: string
  cleanup: string
}
