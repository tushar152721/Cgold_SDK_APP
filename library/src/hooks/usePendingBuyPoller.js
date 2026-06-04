import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { requireConfig } from '../configStore';
import { sdkApi } from '../api/client';
import { clearProfileCache } from '../utils/profileCache';
import { processTradeHistoryForNotifications } from '../utils/buyOrderNotifications';
import { getPendingBuyIds } from '../utils/pendingBuyTracker';

const POLL_MS = 25000;

/**
 * Poll trade history while orders are processing; surface banners + host onEvent on execute/reject.
 */
export function usePendingBuyPoller(options = {}) {
  const { enabled = true, pollIntervalMs = POLL_MS } = options;
  const config = requireConfig();
  const [banner, setBanner] = useState(null);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const dismissBanner = useCallback(() => {
    setBanner(null);
  }, []);

  const poll = useCallback(async () => {
    if (!config.userToken || !enabled) {
      return;
    }
    try {
      const res = await sdkApi.getTradeHistory({ page: 1, limit: 20 });
      const apiBody = res?.data ?? {};
      const data = apiBody.data ?? apiBody;
      const items = data.items ?? [];
      const { executed, rejected, processingCount } =
        processTradeHistoryForNotifications(items);

      if (!mountedRef.current) {
        return;
      }

      if (executed.length > 0) {
        const last = executed[0];
        const gm = last?.goldGm != null ? Number(last.goldGm) : null;
        clearProfileCache();
        setBanner({
          kind: 'executed',
          message:
            gm != null
              ? `Your gold purchase is complete — ${gm} g has been added. Bounz points were redeemed.`
              : 'Your gold purchase is complete. Bounz points were redeemed.',
          goldGm: gm,
        });
        return;
      }

      if (rejected.length > 0) {
        const last = rejected[0];
        const gm = last?.goldGm != null ? Number(last.goldGm) : null;
        setBanner({
          kind: 'rejected',
          message:
            gm != null
              ? `Your order for ${gm} g could not be completed. Locked points were released.`
              : 'Your order could not be completed. Locked points were released.',
          goldGm: gm,
        });
        return;
      }

      const watching = getPendingBuyIds().length > 0;
      if (processingCount > 0 || watching) {
        setBanner(prev =>
          prev?.kind === 'executed' || prev?.kind === 'rejected'
            ? prev
            : {
                kind: 'processing',
                message:
                  'Your order is processing. Gold and points will update when the market order completes.',
              },
        );
      } else {
        setBanner(prev => (prev?.kind === 'processing' ? null : prev));
      }
    } catch {
      /* ignore poll errors */
    }
  }, [config.userToken, enabled]);

  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      poll();
      intervalRef.current = setInterval(poll, pollIntervalMs);
      return () => {
        mountedRef.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [poll, pollIntervalMs]),
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { banner, dismissBanner, refreshOrderStatus: poll };
}
