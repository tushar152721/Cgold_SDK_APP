import { useEffect, useState } from 'react';
import { subscribeSdkPrice } from '../utils/sdkPriceSocket';

export default function useSdkPriceSocket() {
  const [price, setPrice] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const onUpdate = ({ price: nextPrice, connected: nextConnected }) => {
      if (!mounted) {
        return;
      }
      if (nextPrice !== undefined) {
        setPrice(nextPrice);
      }
      if (nextConnected !== undefined) {
        setConnected(nextConnected);
      }
    };

    const unsubscribe = subscribeSdkPrice(onUpdate);

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { price, connected };
}
