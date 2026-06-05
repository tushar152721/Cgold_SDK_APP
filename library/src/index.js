import ComtechGold from './ComtechGold';
import ComtechGoldProvider from './provider/ComtechGoldProvider';
import ComtechGoldSdk from './ComtechGoldSdk';

/**
 * Minimal package entry — only core exports so `Sdk` loads reliably.
 * Screen / navigator re-exports live in `./exports/screens.js` (optional).
 */
export { ComtechGold, ComtechGoldProvider, ComtechGoldSdk };

/** Drop-in component — init, navigation, register, KYC, and buy handled internally. */
export const Sdk = ComtechGoldSdk;

export default ComtechGold;
