import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import SdkToast from '../components/SdkToast';

const SdkToastContext = createContext(null);

export function SdkToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const hideTimerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      if (!message) {
        return;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      setToast({
        message: String(message),
        type: options.type || 'success',
        duration: options.duration ?? 4500,
      });
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null;
        setToast(null);
      }, options.duration ?? 4500);
    },
    [],
  );

  return (
    <SdkToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <SdkToast toast={toast} onDismiss={hideToast} />
    </SdkToastContext.Provider>
  );
}

export function useSdkToast() {
  const ctx = useContext(SdkToastContext);
  if (!ctx) {
    return {
      showToast: () => {},
      hideToast: () => {},
    };
  }
  return ctx;
}
