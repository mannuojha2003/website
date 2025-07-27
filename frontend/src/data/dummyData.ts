import { EntryType, Entry } from '../types';

export const dummyData: Record<EntryType, Entry[]> = {
  Quotation: [
    {
      quotation_no: 'Q-001',
      company_name: 'ABC Ltd',
      unit: 'AT',
      description: 'Sample Quotation',
      date: '2025-07-01',
    },
  ],
  Invoice: [
    {
      invoice_no: 'I-001',
      company_name: 'XYZ Corp',
      unit: 'AT',
      description: 'Invoice Description',
      date: '2025-07-02',
      reference_no: 'REF-123',
    },
  ],
  Sale: [
    {
      selling_company: 'Company A',
      buying_company: 'Company B',
      unit: 'AT',
      amount: 10000,
      mop: 'NEFT',
      date: '2025-07-03',
    },
  ],
  Purchase: [
    {
      buying_company: 'Company C',
      selling_company: 'Company D',
      unit: 'AT',
      amount: 15000,
      mop: 'UPI',
      date: '2025-07-04',
    },
  ],
};
