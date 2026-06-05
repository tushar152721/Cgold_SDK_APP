export const STATEMENT_FILTERS = ['All', 'Gold', 'Fund'];

export function formatStatementDate(value) {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

export function formatStatementDisplayDate(value) {
  if (!value) {
    return '';
  }
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/** DD-MM-YYYY for backend audits API */
export function formatStatementApiDate(date) {
  if (!date) {
    return '';
  }
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function statementTransactionTitle(transactionType) {
  if (!transactionType) {
    return 'Transaction';
  }
  const lower = String(transactionType).toLowerCase();
  if (lower.includes('trade_buy')) {
    return 'Buy Gold';
  }
  if (lower.includes('trade_sell')) {
    return 'Sell Gold';
  }
  if (lower.includes('fund_deposit')) {
    return 'Fund Deposit';
  }
  if (lower.includes('fund_withdraw') || lower.includes('fund_withdre')) {
    return 'Fund Withdrawal';
  }
  if (lower.includes('gift_in')) {
    return 'Gift Received';
  }
  if (lower.includes('gift_out')) {
    return 'Gift Sent';
  }
  if (lower.includes('redeem')) {
    return 'Redemption';
  }
  return transactionType;
}

export function isGoldStatementType(transactionType) {
  const lower = String(transactionType || '').toLowerCase();
  return (
    lower.includes('trade') ||
    lower.includes('gift') ||
    lower.includes('redeem') ||
    lower.includes('gold')
  );
}

export function isFundStatementType(transactionType) {
  const lower = String(transactionType || '').toLowerCase();
  return lower.includes('fund') && !lower.includes('trade');
}

export function parseStatementResponse(res) {
  const body = res?.data ?? {};
  const items = Array.isArray(body.data) ? body.data : [];
  return {
    items,
    opening: body.opening ?? null,
    closing: body.closing ?? null,
    currency: body.currency || 'AED',
  };
}

export function mapStatementAuditItem(item) {
  const id = String(item?._id || item?.id || item?.transactionNumber || Math.random());
  const transactionType = item?.transactionType || '';
  const lower = transactionType.toLowerCase();
  const isGold = isGoldStatementType(transactionType);
  const isFund = isFundStatementType(transactionType);

  let amountLabel = null;
  let amountGm = null;

  if (isGold && !isFund) {
    const qty = Number(item?.quantityGms ?? 0);
    const positive = lower.includes('gift_in') || lower.includes('trade_buy');
    amountGm = qty;
    amountLabel = `${positive ? '+' : ''}${qty.toFixed(2)} gms`;
  } else {
    const raw = Number(item?.value ?? item?.price ?? 0);
    amountLabel = raw.toFixed(2);
  }

  const fundBalance = Number(item?.finalFundBalance ?? 0);
  const goldBalance = Number(item?.finalGoldBalanceGms ?? 0);
  const price = Number(item?.price ?? 0);

  let priceHint = null;
  if (lower.includes('trade_buy') && price > 0) {
    priceHint = `Gold price during purchase: AED ${price.toFixed(2)}/g`;
  } else if (lower.includes('trade_sell') && price > 0) {
    priceHint = `Gold price during sell: AED ${price.toFixed(2)}/g`;
  }

  return {
    id,
    transactionType,
    title: statementTransactionTitle(transactionType),
    date: item?.createdAt || item?.date,
    amountLabel,
    amountGm,
    status: item?.status || 'Success',
    transactionNumber: item?.transactionNumber || '',
    price,
    priceHint,
    balanceLabel: isFund ? 'My balance' : 'Gold balance',
    balanceValue: isFund
      ? fundBalance.toFixed(2)
      : `${goldBalance.toFixed(2)} gms`,
    isGold,
    isFund,
  };
}

/** Newest transactions first (main app shows reversed list). */
export function sortStatementItemsNewestFirst(items) {
  return [...items].sort((a, b) => {
    const ta = new Date(a?.date || 0).getTime();
    const tb = new Date(b?.date || 0).getTime();
    return tb - ta;
  });
}

export function buildStatementQueryParams({
  monthDate,
  startDate,
  endDate,
  filter,
}) {
  const params = {};

  if (startDate && endDate) {
    params.startdate = formatStatementApiDate(startDate);
    params.enddate = formatStatementApiDate(endDate);
  } else if (monthDate) {
    params.date = (monthDate instanceof Date ? monthDate : new Date(monthDate)).toISOString();
  }

  if (filter === 'Gold') {
    params.transactionType = 'gold';
  } else if (filter === 'Fund') {
    params.transactionType = 'fund';
  }

  return params;
}

export function statementStaticPdfUrl(apiBaseUrl, filename) {
  if (!filename || !apiBaseUrl) {
    return null;
  }
  const base = String(apiBaseUrl).replace(/\/$/, '');
  const path = String(filename).replace(/^\//, '');
  return `${base}/static/${path}`;
}
