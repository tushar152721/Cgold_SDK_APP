import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_MARKET_CONVERSION } from '../constants';
import {
  formatAedAmount,
  formatMarketGoldRateAed,
  marketGoldRateAed,
} from '../utils/currency';
import { useSdkPrice } from './SdkPriceContext';

const SdkCurrencyContext = createContext({
  buyConversion: DEFAULT_MARKET_CONVERSION,
  formatAed: () => '',
  formatMarketGoldRate: () => '',
  getMarketGoldRate: () => 0,
  symbol: 'AED',
});

/** AED-only; market rate = buyGm × buyConversion (USD→AED). */
export function SdkCurrencyProvider({ children }) {
  const { price } = useSdkPrice();
  const [buyConversion, setBuyConversion] = useState(DEFAULT_MARKET_CONVERSION);

  useEffect(() => {
    const rate = Number(price?.buyConversion);
    if (rate && !Number.isNaN(rate)) {
      setBuyConversion(rate);
    }
  }, [price?.buyConversion]);

  const formatAed = useCallback(
    (aedAmount, decimals = 2) => formatAedAmount(aedAmount, decimals),
    [],
  );

  const getMarketGoldRate = useCallback(
    buyGm => marketGoldRateAed(buyGm, buyConversion),
    [buyConversion],
  );

  const formatMarketGoldRate = useCallback(
    (buyGm, decimals = 2) =>
      formatMarketGoldRateAed(buyGm, buyConversion, decimals),
    [buyConversion],
  );

  const value = useMemo(
    () => ({
      buyConversion,
      formatAed,
      formatMarketGoldRate,
      getMarketGoldRate,
      symbol: 'AED',
    }),
    [buyConversion, formatAed, formatMarketGoldRate, getMarketGoldRate],
  );

  return (
    <SdkCurrencyContext.Provider value={value}>
      {children}
    </SdkCurrencyContext.Provider>
  );
}

export function useSdkCurrency() {
  return useContext(SdkCurrencyContext);
}
