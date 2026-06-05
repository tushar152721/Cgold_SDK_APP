/** UI-only defaults for direct bank transfer (matches ComTech Gold fund deposit flow). */
export const FUND_DEPOSIT_BANK_INFO = {
  accountName: 'COMTECH CORE TRADING FZCO',
  swiftBic: 'ZANDAEAA008',
  iban: 'AE690961002169010000001',
  accountNumber: '1002169010000001',
  bank: 'ZAND Bank',
  currency: 'AED',
};

export const FUND_PAYMENT_METHODS = [
  { id: 'credit_debit', label: 'Credit/Debit', icon: 'card' },
  { id: 'direct_transfer', label: 'Direct Transfer', icon: 'transfer' },
];

export const FUND_DEPOSIT_NOTE =
  'Note: Credit/debit payments include service charges and VAT (shown before pay). For direct transfer, complete the transfer from your bank app, then enter the transaction reference below.';
