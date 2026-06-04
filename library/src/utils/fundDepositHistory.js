/**
 * Normalize SDK fund deposit list response (mongoose-aggregate-paginate).
 * Main app: res.data.docs, res.data.totalPages
 */
export function parseDepositFundHistoryResponse(res) {
  const body = res?.data ?? {};
  return {
    docs: body.docs ?? [],
    page: body.page ?? 1,
    totalPages: body.totalPages ?? 0,
    totalDocs: body.totalDocs ?? 0,
    limit: body.limit ?? 20,
    raw: body,
  };
}

export function fundDepositHistoryTitle(item) {
  const via = String(item?.paymentVia || '').trim();
  if (/direct/i.test(via)) {
    return 'Direct deposit';
  }
  if (/online/i.test(via)) {
    return 'Online deposit';
  }
  return via || 'Fund deposit';
}

export function fundDepositHistoryStatus(item) {
  return String(item?.status || 'Pending');
}

export function fundDepositHistoryMeta(item) {
  const parts = [];
  const trNo = String(item?.trNo || '').trim();
  if (trNo && trNo !== '~') {
    parts.push(`Txn ${trNo}`);
  }
  const way = String(item?.onlineTransactionWay || '').trim();
  if (way && way !== '~' && way !== 'SDK_BOUNZ') {
    parts.push(way);
  } else if (item?.paymentVia === 'Direct Deposit') {
    parts.push('Direct Transfer');
  }
  return parts.length ? parts.join(' · ') : null;
}

export function mapFundDepositDoc(item) {
  return {
    id: String(item._id),
    ...item,
  };
}
