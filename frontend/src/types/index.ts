// src/types/index.ts
export type Role = 'admin' | 'employee';


export type EntryType =
  | 'Quotation'
  | 'Invoice'
  | 'Purchase'
  | 'Sale'
  | 'Expense'
  | 'Payment Pending'
  | 'Goods Exp'
  | 'Cash Exp';

export interface ItemRow {
  item: string;
  denomination: string;
  quantity: string;
  rate: string;
}

export interface Entry {
  [key: string]: any;
  description?: ItemRow[]; // multiple items per entry
  total?: string;
}
