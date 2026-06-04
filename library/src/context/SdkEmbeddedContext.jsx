import React, { createContext, useContext } from 'react';

const SdkEmbeddedContext = createContext({ embedded: false });

export function SdkEmbeddedProvider({ children, embedded = false }) {
  return (
    <SdkEmbeddedContext.Provider value={{ embedded }}>
      {children}
    </SdkEmbeddedContext.Provider>
  );
}

export function useSdkEmbedded() {
  return useContext(SdkEmbeddedContext);
}
