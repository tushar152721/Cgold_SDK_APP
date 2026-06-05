/** Buy gold with fund balance or online card (Geidea). */
export const BUY_GOLD_PAYMENT_METHODS = [
  { id: 'my_balance', label: 'My Balance', icon: 'wallet' },
  { id: 'credit_debit', label: 'Credit/Debit', icon: 'card' },
];

export const BUY_GOLD_PAYMENT_NOTES = {
  my_balance:
    'No taxes or charges for balance payments. Gold is purchased from your available fund balance.',
  credit_debit:
    'Service charges and VAT apply for card payments (shown before you pay).',
};

/** Bounz points trade — separate checkout from fund/card buy gold. */
export const BOUNZ_TRADE_PAYMENT_METHODS = [
  { id: 'bounz_points', label: 'Bounz Points', icon: 'wallet' },
  { id: 'fund_or_card', label: 'Fund & Card', icon: 'card' },
];

export const BOUNZ_TRADE_PAYMENT_NOTES = {
  bounz_points:
    'Points are locked at checkout through ClubClass until the market order completes.',
  fund_or_card:
    'Buy gold using your fund balance or pay by credit/debit card via Geidea.',
};

export const BUY_GOLD_NOTE =
  'Minimum purchase applies. Market must be open for live pricing. Complete KYC before buying gold.';
