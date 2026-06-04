/**
 * @typedef {'local' | 'demo' | 'prod'} ComtechGoldEnvironment
 */

/**
 * @typedef {Object} ComtechGoldUserDetails
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [email]
 * @property {string} [password]
 */

/**
 * @typedef {Object} ComtechGoldInitParams
 * @property {string} mobile
 * @property {string} countryCode
 * @property {string} [loyaltyId]
 * @property {string} [partnerCode] - default BOUNZ
 * @property {string} [partnerKey] - X-Sdk-Partner-Key
 * @property {string} [apiKey] - alias for partnerKey
 * @property {string} [userToken] - existing SDK user JWT after link
 * @property {ComtechGoldEnvironment} [environment]
 * @property {string} [apiBaseUrl] - override API root (no /api suffix), e.g. http://192.168.1.9:5055
 * @property {ComtechGoldUserDetails} [userDetails]
 * @property {'in_app' | 'external'} [kycOpenMode]
 * @property {Function} [onKycStarted]
 */

/**
 * @typedef {Object} ComtechGoldConfig
 * @property {boolean} initialized
 * @property {string} mobile
 * @property {string} countryCode
 * @property {string} loyaltyId
 * @property {string} partnerCode
 * @property {string} partnerKey
 * @property {string} [userToken]
 * @property {ComtechGoldEnvironment} environment
 * @property {string} apiBaseUrl
 * @property {ComtechGoldUserDetails} [userDetails]
 * @property {'in_app' | 'external'} [kycOpenMode]
 * @property {Function} [onKycStarted]
 */

/**
 * @typedef {'init' | 'register' | 'kyc' | 'buy' | 'error'} ComtechGoldEventType
 * @description `buy` with action `placed` (hedge pending), `executed` (filled), or `rejected`; `error` with source `buy` on failure.
 */

/**
 * @typedef {Object} ComtechGoldEvent
 * @property {ComtechGoldEventType} type
 * @property {Record<string, unknown>} [payload]
 */

export {};
