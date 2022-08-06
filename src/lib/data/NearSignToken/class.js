const { BaseObjectClass } = require("../WrappedBaseParseObj/class");
const { generateRandomUrlBase64String, restrictToMasterKeyOnly } = require("../../Utils");

class NearSignToken extends BaseObjectClass {
  static KEYS = require("./struct").NearSignNonceStruct;

  constructor(obj) {
    super(obj);
    this.keys = NearSignToken.KEYS;
  }

  getWalletId = () => this.linkedObject.get(this.keys.walletId);
  getToken = () => this.linkedObject.get(this.keys.token);

  /**
   * @param walletId{String}
   * @returns {NearSignToken}
   */
  setWalletId = (walletId) => {
    return this._set(this.keys.walletId, walletId);
  };

  /**
   * @returns {NearSignToken}
   */
  generateToken = () => {
    const token = generateRandomUrlBase64String(24);
    return this._set(this.keys.token, token);
  };

  static generateNew = async (walletId) => {
    const obj = new NearSignToken(new Parse.Object(NearSignToken.KEYS.className));
    obj.generateToken();
    obj.setWalletId(walletId);
    await obj.save(true);
    await restrictToMasterKeyOnly(obj.linkedObject);
    return obj;
  };

  static getTokenForWalletId = async (token, walletId) => {
    const query = new Parse.ParseQuery(NearSignToken.KEYS.className);
    query.equalTo(NearSignToken.KEYS.token, token);
    query.equalTo(NearSignToken.KEYS.walletId, walletId);
    const tokenObj = await query.first({ useMasterKey: true });

    return tokenObj ? new NearSignToken(tokenObj) : null;
  };
}

module.exports = {
  NearSignToken,
};
