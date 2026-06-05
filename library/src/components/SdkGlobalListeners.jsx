import React from 'react';
import { requireConfig } from '../configStore';
import { useGoldBalanceUpdatePoller } from '../hooks/useGoldBalanceUpdatePoller';

/** Background listeners mounted once for the embedded SDK shell. */
export default function SdkGlobalListeners() {
  const config = requireConfig();
  useGoldBalanceUpdatePoller({ enabled: Boolean(config.userToken) });
  return null;
}
