import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { requireConfig } from '../configStore';
import { sdkApi } from '../api/client';
import { clearProfileCache } from '../utils/profileCache';
import { processTradeHistoryForNotifications } from '../utils/buyOrderNotifications';
import { getPendingBuyIds } from '../utils/pendingBuyTracker';
import {
  markGoldBalanceToasted,
  wasGoldBalanceToasted,
  clearGoldBalanceWatch,
} from '../utils/goldBalanceWatcher';
import { useSdkToast } from '../context/SdkToastContext';
import { notifyDashboardGoldRefresh } from '../utils/dashboardRefreshBus';
import { parseBuyGoldHistoryResponse } from '../utils/buyGoldHistory';

const POLL_MS = 25000;

/**
 * Poll trade history while orders are processing; surface banners + host onEvent on execute/reject.
 */
export function usePendingBuyPoller(options = {}) {
  const { enabled = true, pollIntervalMs = POLL_MS } = options;
  const config = requireConfig();
  const { showToast } = useSdkToast();
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
      const res = await sdkApi.getBuyGoldHistory(1, 20);
      const { items } = parseBuyGoldHistoryResponse(res);
      const { executed, rejected, processingCount } =
        processTradeHistoryForNotifications(items);

      if (!mountedRef.current) {
        return;
      }

      if (executed.length > 0) {
        const last = executed[0];
        const gm = last?.goldGm != null ? Number(last.goldGm) : null;
        const buyGoldId = last?.buyGoldId;
        clearProfileCache();
        if (buyGoldId && !wasGoldBalanceToasted(buyGoldId)) {
          markGoldBalanceToasted(buyGoldId);
          clearGoldBalanceWatch(buyGoldId);
          showToast(
            gm != null
              ? `Your gold balance is updated — ${gm} g has been added to your holdings.`
              : 'Your gold balance is updated.',
            { type: 'success', duration: 5000 },
          );
        }
        const usedPoints = last?.points != null || last?.source === 'bounz_points';
        notifyDashboardGoldRefresh({
          goldGm: gm,
          source: usedPoints ? 'points' : 'buy',
        });
        setBanner({
          kind: 'executed',
          message:
            gm != null
              ? usedPoints
                ? `Your gold purchase is complete — ${gm} g has been added. Bounz points were redeemed.`
                : `Your gold purchase is complete — ${gm} g has been added to your holdings.`
              : usedPoints
                ? 'Your gold purchase is complete. Bounz points were redeemed.'
                : 'Your gold purchase is complete.',
          goldGm: gm,
        });
        return;
      }

      if (rejected.length > 0) {
        const last = rejected[0];
        const gm = last?.goldGm != null ? Number(last.goldGm) : null;
        const usedPoints = last?.points != null || last?.source === 'bounz_points';
        setBanner({
          kind: 'rejected',
          message:
            gm != null
              ? usedPoints
                ? `Your order for ${gm} g could not be completed. Locked points were released.`
                : `Your order for ${gm} g could not be completed.`
              : usedPoints
                ? 'Your order could not be completed. Locked points were released.'
                : 'Your order could not be completed.',
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
                  'Your order is processing. Your holdings will update when the market order completes.',
              },
        );
      } else {
        setBanner(prev => (prev?.kind === 'processing' ? null : prev));
      }
    } catch {
      /* ignore poll errors */
    }
  }, [config.userToken, enabled, showToast]);

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
