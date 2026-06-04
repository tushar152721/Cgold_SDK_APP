# ComTech Gold React Native SDK

Partner integration (Bounz): initialize with **mobile**, **country code**, **partner key**, then **link** via `/api/sdk/bounz/user`, **KYC**, and **buy with Bounz points**. Live gold price uses Socket.IO `getpriceUpdate` on the API host.

## Install in a host app (from GitHub)

The npm package lives in the `library/` folder of [tushar152721/Cgold_SDK_APP](https://github.com/tushar152721/Cgold_SDK_APP):

```bash
npm install github:tushar152721/Cgold_SDK_APP#main:library
```

Or in `package.json`:

```json
{
  "dependencies": {
    "@comtechgold/react-native-sdk": "github:tushar152721/Cgold_SDK_APP#main:library"
  }
}
```

Then install peer dependencies (see `library/README.md`).

## Structure

```
comtechgold-sdk/
├── library/          @comtechgold/react-native-sdk (npm package)
├── example/
│   └── ComtechGoldSdkDemo/   Runnable demo host app
└── README.md
```

## Quick start (demo app)

```bash
cd example/ComtechGoldSdkDemo
npm install
npm run android
```

Edit init values in `example/ComtechGoldSdkDemo/src/HostScreen.tsx`:

```typescript
const INIT_PARAMS = {
  mobile: '502753543',
  countryCode: '+971',
  loyaltyId: '',
  partnerCode: 'BOUNZ',
  partnerKey: 'bounz-local-sdk-partner-key',
  environment: 'local', // http://localhost:5055
};
```

## Host app integration

```javascript
import ComtechGold, { ComtechGoldProvider } from '@comtechgold/react-native-sdk';

await ComtechGold.init({
  mobile: '502753543',
  countryCode: '+971',
  partnerCode: 'BOUNZ',
  partnerKey: 'bounz-local-sdk-partner-key',
  environment: 'local',
});

ComtechGold.openLink();      // bootstrap → JWT
ComtechGold.openSdk();       // home: KYC + points buy
```

Wrap with:

```javascript
<ComtechGoldProvider HostScreen={YourHostScreen} />
```

## Android Shufti preset

In host `android/app/build.gradle`:

```gradle
apply from: file("../../node_modules/@comtechgold/react-native-sdk/gradle/comtechgold-android.gradle")
```

See `library/README.md` for full API.
