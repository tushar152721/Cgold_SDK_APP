export const PAYMENT_GATEWAY = {
  GEIDEA: 'Geidea',
  URBAN_LEDGER: 'UrbanLedger',
};

const DEFAULT_BY_CURRENCY = {
  AED: PAYMENT_GATEWAY.GEIDEA,
  USD: PAYMENT_GATEWAY.URBAN_LEDGER,
};

export function getGatewayForCurrency(currency, settings = {}) {
  const code = String(currency || 'AED').toUpperCase();
  const map = settings?.paymentGatewayByCurrency || {};
  return map[code] || DEFAULT_BY_CURRENCY[code] || PAYMENT_GATEWAY.GEIDEA;
}

export function isGeideaGateway(gateway) {
  return String(gateway || '').toLowerCase() === 'geidea';
}
