# Near wallet Auth Adapter for parse server

This package allows parse users to login using their near wallets

## Install

```shell
npm i parse-near-auth-adapter
```

or if you prefer `yarn`

```shell
yarn add parse-near-auth-adapter
```

## Setup

1. Add NearAuthAdapter to your parse server options

```javascript
const { NearAuthAdapter } = require("parse-near-auth-adapter");

const parseServerApi = new ParseServer({
  ...restOfParseOptions,
  auth: {
    NearAuthAdapter: {
      module: NearAuthAdapter,
      connectionConfig: {
        networkId: "testnet", // if main net change this to main net
        nodeUrl: "https://rpc.testnet.near.org", // change to match network id
        walletUrl: "https://wallet.testnet.near.org", // change to match network id
        helperUrl: "https://helper.testnet.near.org", // change to match network id
        explorerUrl: "https://explorer.testnet.near.org", // change to match network id
      },
    },
  },
});
```

2. Setup Cloud code

```javascript
const { setupNearAuthAdapterCloudCode } = require("parse-near-auth-adapter");

// setup your other cloud functions
setupNearAuthAdapterCloudCode(); // this will set one cloud function used to generate tokens
```

You are all set now, you can start using it on clients

## Client side example (Linking Users)

```javascript
import * as nearAPI from "near-api-js";
import { sha256 } from "js-sha256";

// we assume you already signin to near wallet via  wallet.requestSignIn()
// we assume Parse user is already signin
const linkWallet = async () => {
  const currentWallet = {
    accountId: walletConnection.getAccountId(),
    balance: (await walletConnection.account().state()).amount,
  };
  // this means the near wallet is not connected to your website (use the near requestSignin to connect near wallet to your website)
  if (!currentWallet?.accountId) return;

  const res = await Parse.Cloud.run("getNearSignToken", { walletId: currentUser?.accountId }).catch((error) => {
    // handle error
  });
  // this is the token that needs to be signed
  const token = res?.data?.get("token");

  // get the signer from the wallet connection
  const signer = (await wallet.account()).connection.signer;
  // get the keyPar for the signer
  const key = await signer.keyStore.getKey(nearConfig.networkId, currentUser.accountId);
  // sha256 the token to prepare for signing
  const digestedToken = new Uint8Array(sha256.array(token));

  // sign using the key pair
  const signed = await key.sign(digestedToken, currentUser.accountId, nearConfig.networkId);

  // get string representation of public key
  const publicKey = key.publicKey.toString();
  // get hex representation of the signature
  const signature = Buffer.from(signed.signature).toString("hex");
  // id is the connected near wallet accountId
  const id = currentUser.accountId;

  // more details on the please visit:
  // https://docs.parseplatform.org/js/guide/#linking-users
  // The NearAuthAdapter expects this authdata
  const authData = { publicKey, signature, id, token };

  let provider;
  provider = {
    authenticate: (options) => {
      options.success(provider, { ...authData });
    },
    restoreAuthentication() {
      return true;
    },

    getAuthType() {
      return "NearAuthAdapter";
    },

    getAuthData() {
      return {
        authData: {
          ...authData,
        },
      };
    },
  };

  // get current logged in Parse User
  const user = await Parse.User.currentAsync();
  // register the provider to allow linking
  await Parse.User._registerAuthenticationProvider(provider);
  // link user with the provider
  await user.linkWith(provider.getAuthType(), authData).catch((error) => {
    // handle error
  });
  // check if linked
  user._isLinked(provider); // should be true
};
```

## Client side example (Login)

```javascript
const login = async () => {
  const currentWallet = {
    accountId: walletConnection.getAccountId(),
    balance: (await walletConnection.account().state()).amount,
  };
  // this means the near wallet is not connected to your website (use the near requestSignin to connect near wallet to your website)
  if (!currentWallet?.accountId) return;

  // call cloud function to get a fresh token
  const res = await Parse.Cloud.run("getNearSignToken", { walletId: currentUser?.accountId }).catch((error) => {
    // handle error
  });
  // this is the token that needs to be signed
  const token = res?.data?.get("token");

  // get the signer from the wallet connection
  const signer = (await wallet.account()).connection.signer;
  // get the keyPar for the signer
  const key = await signer.keyStore.getKey(nearConfig.networkId, currentUser.accountId);
  // sha256 the token to prepare for signing
  const digestedToken = new Uint8Array(sha256.array(token));

  // sign using the key pair
  const signed = await key.sign(digestedToken, currentUser.accountId, nearConfig.networkId);

  // get string representation of public key
  const publicKey = key.publicKey.toString();
  // get hex representation of the signature
  const signature = Buffer.from(signed.signature).toString("hex");
  // id is the connected near wallet accountId
  const id = currentUser.accountId;

  // more details on the please visit:
  // https://docs.parseplatform.org/js/guide/#linking-users
  // The NearAuthAdapter expects this authdata
  const authData = { publicKey, signature, id, token };

  const user = await Parse.User.LogInWith("NearAuthAdapter", {
    authData,
  }).catch((error) => {
    // handle error
    // probably no linked wallet , or signature mismatch
  });
  if (user) {
    // user is the currently logged in user
  }
};
```

## How Does it work ?

The Near Auth adapter is simple and straight forward, these are the steps

1. client requests a token (the token is a randomly generated base64Url string)
2. client hashes the token using sha256 and then sign it through the near-js-api
3. client sends to Parse Server the near accountId, publicKey as string (from the pair that signed the token), the token as string, and a hex string representation of the signature
4. Parse server will check the following and only link/login if all pass:
   - the provided publicKey is actually a valid accessKey that belongs the provided near accountID
   - The token is a valid token generated by parse server and is not older than 5 minutes
   - the signature is valid

## Licence:

Project is distributed under MIT license.

## contributions

Contributions are welcomes

## Sponsors

This adapter was made possible by [agoraneos](https://agoraneos.com/)
