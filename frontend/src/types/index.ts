// src/types/index.ts

export type EntryType =
  | 'Quotation'
  | 'Invoice'
  | 'Purchase'
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
