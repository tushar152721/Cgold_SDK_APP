import React, { createContext, useContext } from 'react';
import useSdkPriceSocket from '../hooks/useSdkPriceSocket';

const SdkPriceContext = createContext({
  price: null,
  connected: false,
});

export function SdkPriceProvider({ children }) {
  const value = useSdkPriceSocket();
  return (
    <SdkPriceContext.Provider value={value}>
      {children}
    </SdkPriceContext.Provider>
  );
}

export function useSdkPrice() {
  return useContext(SdkPriceContext);
}
