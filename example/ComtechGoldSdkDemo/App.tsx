import React from 'react';
import ComtechGold, { ComtechGoldProvider } from '@comtechgold/react-native-sdk';
import HostScreen from './src/HostScreen';

function App() {
  return (
    <ComtechGoldProvider
      HostScreen={HostScreen}
      onEvent={event => {
        if (__DEV__) {
          console.log('[ComtechGold SDK]', event);
        }
      }}
    />
  );
}

export default App;
