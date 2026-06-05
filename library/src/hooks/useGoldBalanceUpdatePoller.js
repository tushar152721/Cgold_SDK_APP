import { useCallback, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { requireConfig } from '../configStore';
import { loadSdkProfile, clearProfileCache } from '../utils/profileCache';
import {
  getPendingGoldBalanceWatches,
  clearGoldBalanceWatch,
  isGoldBalanceUpdated,
  wasGoldBalanceToasted,
  markGoldBalanceToasted,
} from '../utils/goldBalanceWatcher';
import { clearPendingBuyWatch } from '../utils/pendingBuyTracker';
import { useSdkToast } from '../context/SdkToastContext';
import { notifyDashboardGoldRefresh } from '../utils/dashboardRefreshBus';

const POLL_MS = 12000;
const MAX_WATCH_MS = 15 * 60 * 1000;

function buildBalanceToastMessage(goldGm, source) {
  const gm =
    goldGm != null && Number.isFinite(Number(goldGm))
      ? `${Number(goldGm)} g`
      : 'gold';
  if (source === 'points') {
    return `Your gold balance is updated — ${gm} has been added to your holdings.`;
  }
  return `Your gold balance is updated — ${gm} has been credited to your account.`;
}

/**
 * Poll profile gold total while fund/card/point buys are settling; toast on credit.
 */
export function useGoldBalanceUpdatePoller(options = {}) {
  const { enabled = true, pollIntervalMs = POLL_MS } = options;
  const config = requireConfig();
  const { showToast } = useSdkToast();
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!config.userToken || !enabled) {
      return;
    }

    const watches = getPendingGoldBalanceWatches();
    if (watches.length === 0) {
      return;
    }

    try {
      const profile = await loadSdkProfile({ force: true });
      const currentGold = Number(profile?.user?.goldTotal ?? 0);

      for (const watch of watches) {
        const {
          buyGoldId,
          baselineGold,
          goldGm,
          source,
          startedAt,
          earliestToastAt,
        } = watch;

        if (Date.now() - (startedAt || 0) > MAX_WATCH_MS) {
          clearGoldBalanceWatch(buyGoldId);
          clearPendingBuyWatch(buyGoldId);
          continue;
        }

        if (Date.now() < (earliestToastAt || 0)) {
          continue;
        }

        if (!isGoldBalanceUpdated(baselineGold, currentGold, goldGm)) {
          continue;
        }

        if (wasGoldBalanceToasted(buyGoldId)) {
          clearGoldBalanceWatch(buyGoldId);
          clearPendingBuyWatch(buyGoldId);
          continue;
        }

        markGoldBalanceToasted(buyGoldId);
        clearGoldBalanceWatch(buyGoldId);
        clearPendingBuyWatch(buyGoldId);
        clearProfileCache();

        if (mountedRef.current) {
          showToast(buildBalanceToastMessage(goldGm, source), {
            type: 'success',
            duration: 5000,
          });
          notifyDashboardGoldRefresh({ goldGm, source });
        }
      }
    } catch {
      /* ignore poll errors */
    }
  }, [config.userToken, enabled, showToast]);

  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
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

  return { refreshGoldBalance: poll };
}
