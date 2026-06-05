/**
 * Normalize SDK buy-gold / trade history (GET /trade/history).
 * Backend mirrors main app GET /buygold pagination (docs + totalPages).
 */

export function parseBuyGoldHistoryResponse(res) {
  const body = res?.data ?? {};
  const data = body.data ?? body;
  const items = data.items ?? data.docs ?? [];
  return {
    items,
    page: data.page ?? 1,
    totalPages: data.totalPages ?? 0,
    total: data.total ?? data.totalDocs ?? items.length,
    hasNextPage: Boolean(data.hasNextPage ?? (data.page < data.totalPages)),
    raw: data,
  };
}

export function buyGoldHistoryTitle(item) {
  const buyStatus = item?.buyStatus;
  const redemptionStatus = String(item?.status || '').toLowerCase();
  const paymentVia = String(item?.paymentVia || '').toUpperCase();

  if (buyStatus === 'Rejected' || redemptionStatus === 'released' || redemptionStatus === 'failed') {
    return 'Buy not completed';
  }
  if (
    buyStatus === 'Pending' ||
    buyStatus === 'InProgress' ||
    redemptionStatus === 'locked'
  ) {
    return 'Buy processing';
  }

  if (paymentVia === 'BOUNZ_POINTS' || item?.points != null) {
    if (item?.buyGoldId || redemptionStatus === 'redeemed') {
      return 'Gold purchased';
    }
    return 'Bounz points buy';
  }

  if (paymentVia === 'ONLINE_PAYMENT') {
    return 'Gold purchased (online)';
  }

  if (item?.source === 'fund_balance' || paymentVia === 'BANK_TRANSFER') {
    return 'Gold purchased (fund)';
  }

  return 'Gold purchased';
}

export function buyGoldHistoryDisplayStatus(item) {
  const buyStatus = item?.buyStatus;
  const redemptionStatus = String(item?.status || '').toLowerCase();

  if (buyStatus === 'Completed' || redemptionStatus === 'redeemed') {
    return 'redeemed';
  }
  if (buyStatus === 'Rejected' || redemptionStatus === 'released' || redemptionStatus === 'failed') {
    return 'released';
  }
  if (
    buyStatus === 'Pending' ||
    buyStatus === 'InProgress' ||
    redemptionStatus === 'locked'
  ) {
    return 'locked';
  }
  if (buyStatus) {
    return String(buyStatus).toLowerCase();
  }
  return redemptionStatus || item?.status;
}

export function buyGoldHistoryMeta(item, formatAed) {
  const parts = [];

  if (item?.points) {
    parts.push(`${item.points} pts`);
  }

  const paymentVia = String(item?.paymentVia || '').toUpperCase();
  if (paymentVia === 'ONLINE_PAYMENT') {
    parts.push('Online payment');
  } else if (item?.source === 'fund_balance' || paymentVia === 'BANK_TRANSFER') {
    parts.push('Fund balance');
  } else if (paymentVia === 'BOUNZ_POINTS') {
    parts.push('Bounz points');
  }

  const aed =
    item?.amountAed != null
      ? formatAed(Number(item.amountAed), 2)
      : item?.buyAedAmount != null
        ? formatAed(Number(item.buyAedAmount), 2)
        : null;

  if (aed) {
    parts.push(aed);
  }

  return parts.length ? parts.join(' · ') : null;
}

export function mapBuyGoldHistoryItem(item) {
  return {
    ...item,
    id: String(item.buyGoldId || item.id),
  };
}
