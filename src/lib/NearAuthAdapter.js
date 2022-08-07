const nearAPI = require("near-api-js");
const { Uint8ArrayFromHexString } = require("./Utils");
const { sha256 } = require("js-sha256");
const { NearSignToken } = require("./data/NearSignToken/class");

class NearAuthAdapter {
  async validateAuthData(authData, options) {
    const connectionConfig = options.connectionConfig;
    if (!connectionConfig)
      throw new Parse.Error(501, "NearAuthAdapter: connectionConfig is required, please check the configuration docs");
    /**
     * id: walletID that signed the message
     * token: the token that was signed (get it by calling cloud code to get a nearSignToken)
     * signature: hex string representation of the signature
     * publicKey: public key as string
     */
    const { id, token, signature, publicKey } = authData;

    // check authData
    const args = [id, token, signature, publicKey];
    const argsKeys = ["id", "token", "signature", "publicKey"];
    args.forEach((arg, i) => {
      if (!arg) throw new Parse.Error(403, `NearAuthAdapter: ${argsKeys[i]} is required`);
    });

    // check if this token is valid
    const tokenObj = await NearSignToken.getTokenForWalletId(token, publicKey);

    const myKeyStore = new nearAPI.keyStores.InMemoryKeyStore();
    const nearConnection = await nearAPI.connect({
      keyStore: myKeyStore,
      ...connectionConfig,
    });

    /**
     * Will be used to get the public keys of this account and check if the supplied public key belongs to this account
     * @type {Account}
     */
    const account = await nearConnection.account(id);

    /**
     * Used to verify the sigature
     * @type {PublicKey}
     */
    const pubKey = nearAPI.utils.PublicKey.fromString(publicKey);
    /**
     * Uint8Array representation of the signature
     * @type {Uint8Array}
     */
    const uint8ArraySignature = Uint8ArrayFromHexString(signature);

    const valid = pubKey.verify(new Uint8Array(sha256.array(token)), uint8ArraySignature);

    if (!valid) throw new Parse.Error(403, "NearAuthAdapter: signature verification failed");

    /**
     * All access keys present for this walletID
     * @type {AccessKeyInfoView[]}
     */
    const accountKeys = await account.getAccessKeys();

    // see if key is present
    const match = accountKeys.filter((k) => k.public_key === publicKey);

    // if no match throw
    if (!match || match?.length === 0) {
      throw new Parse.Error(403, "NearAuthAdapter: public key is not an assigned access key to the supplied walletId");
    }

    return Promise.resolve(true);
  }

  validateAppId(appIds, authData, options) {
    return Promise.resolve(true);
  }

  static setupCloudCode = () => {
    // get unsigned message
    // create a helper function to verify user's messages
  };
}

module.exports = {
  NearAuthAdapter,
};
