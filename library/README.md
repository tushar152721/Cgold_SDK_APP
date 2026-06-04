# @comtechgold/react-native-sdk

React Native SDK for partner apps (Bounz first): **connect** (register + link), **KYC**, and **buy gold with loyalty points**.

Legacy ComTech app APIs (`/api/user`, `/api/buygold`, etc.) are not used by this package.

## Install

**From GitHub** (package is in the `library/` subdirectory of the monorepo):

```bash
npm install github:YOUR_GITHUB_ORG/comtechgold-sdk#main:library
```

**From npm** (when published to a registry):

```bash
npm install @comtechgold/react-native-sdk
```

**Peer dependencies** (required in the host app):

```bash
npm install @react-native-async-storage/async-storage @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler axios socket.io-client
```

Optional for onsite KYC in the **host** app (not bundled with secrets in the SDK):

```bash
npm install shuftipro-onsite-mobilesdk
```

## Backend prerequisites (local)

1. Start API: `cgoldBackend_old` → `npm run local` (port **5055**).
2. Copy [envs/local.env.example](../../cgoldBackend_old/envs/local.env.example) → `envs/local.env` and set `mongoURI`.
3. Seed partner: `node scripts/seedSdkPartnerBounz.js` (from `cgoldBackend_old`).
4. ClubClass sandbox must accept your test mobile (e.g. `502753543` / `971`).

## Init parameters (required)

| Field | Description |
|--------|-------------|
| `mobile` | User mobile digits (no country prefix in body; normalized server-side) |
| `countryCode` | `971` or `+971` (sent as digits to ClubClass) |
| `loyaltyId` | Partner loyalty id (optional, may be `""`) |
| `partnerCode` | e.g. `BOUNZ` (must match `SdkPartner.code` in MongoDB) |
| `partnerKey` | Same as partner `hmacSecret` from seed / admin |
| `apiBaseUrl` | e.g. `http://10.0.2.2:5055` (Android emulator) or your LAN IP |
| `environment` | `local` \| `demo` \| `prod` (default API host if `apiBaseUrl` omitted) |
| `userDetails` | Optional `{ firstName, lastName, email, password }` for new users on connect |

Partner headers on every SDK API call:

- `X-Sdk-Partner-Code`
- `X-Sdk-Partner-Key`

After connect, user calls use `Authorization: Bearer <token>` from the connect response.

## Drop-in `<Sdk />` (recommended)

```javascript
import { Sdk } from '@comtechgold/react-native-sdk';

export function PartnerHome() {
  return (
    <Sdk
      mobile="502753543"
      countryCode="971"
      loyaltyId=""
      partnerCode="BOUNZ"
      partnerKey="bounz-local-sdk-partner-key"
      apiBaseUrl="http://10.0.2.2:5055"
      environment="local"
      initialRouteName="ConnectComtech"
      onEvent={e => console.log(e)}
    />
  );
}
```

## Connect flow (Phase 1)

```text
ConnectComtechScreen
  → POST /api/sdk/bounz/user/connect  (partner auth)
  → ClubClass member_profile
  → Create/link ComTech user + SdkPartnerUserLink
  → JWT returned → SdkHome
```

Aliases: `POST /bootstrap`, `POST /register` (same handler).

## SDK API surface (user)

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /connect` | Partner | Register + link + JWT |
| `GET /market/meta` | Partner | Price + conversion (pre-login) |
| `GET /profile` | User JWT | Profile, KYC status, points flags |
| `GET /kyc/status` | User JWT | KYC status |
| `POST /kyc/start` | User JWT | Start Shufti → returns `verification_url` |
| `POST /trade/quote` | User JWT | Points quote for grams |
| `POST /trade/buy` | User JWT | Buy with Bounz points (503 if partner maintenance) |

### Maintenance mode (per partner)

Set on `SdkPartner.sdkMaintenanceMode` in MongoDB (`enabled`, optional `message`).  
Read APIs return `maintenanceMode`; `POST /trade/buy` returns **503** with `code: "MAINTENANCE"`.  
SDK shows a banner and disables buy; hosts can listen for `onEvent` with `source: 'maintenance'`.

## Full-app mode

```javascript
import ComtechGold, { ComtechGoldProvider } from '@comtechgold/react-native-sdk';

await ComtechGold.init({
  mobile: '502753543',
  countryCode: '971',
  loyaltyId: '',
  partnerCode: 'BOUNZ',
  partnerKey: 'bounz-local-sdk-partner-key',
  apiBaseUrl: 'http://10.0.2.2:5055',
});

export default function App() {
  return (
    <ComtechGoldProvider HostScreen={HostScreen} onEvent={e => console.log(e)} />
  );
}
```

| Method | Description |
|--------|-------------|
| `init(params)` | Required before navigation |
| `openLink()` / `openRegister()` | Connect screen |
| `openSdk()` | Home (KYC + buy) |
| `openKyc()` | KYC screen |
| `openBuy()` | Buy gold (points) |
| `logout()` | Clear SDK session |

## KYC (Phase 2)

1. User opens **KYC** → `GET /kyc/status`.
2. **Start identity verification** → `POST /kyc/start` (Shufti credentials on server only).
3. SDK opens `verification_url` in-app (`react-native-webview`) or system browser.
4. After Shufti callback, tap **Refresh status** or return to app (auto-refresh on foreground).

Optional init:

```javascript
<Sdk
  kycOpenMode="in_app"   // or "external" for system browser only
  onKycStarted={({ reference, verificationUrl }) => console.log(reference)}
  onEvent={e => {
    if (e.type === 'buy' && e.payload?.action === 'placed') {
      // Order placed (hedge pending) — show host toast
    }
    if (e.type === 'buy' && e.payload?.action === 'executed') {
      // Hedge filled — gold credited, points redeemed
    }
    if (e.type === 'error' && e.payload?.source === 'maintenance') {
      // Partner maintenance — buying disabled
    }
    if (e.type === 'kyc' && e.payload?.action === 'approved') {
      // ready to buy
    }
  }}
/>
```

Host app should install `react-native-webview` for in-app verification.

## Android (Shufti / KYC)

```gradle
apply from: "../../node_modules/@comtechgold/react-native-sdk/gradle/comtechgold-android.gradle"
```

## Example

See `../example/` in this repo. Demo app: `Demoapp/APP`.
