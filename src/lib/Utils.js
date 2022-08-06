const Crypto = require("crypto");
/**
 * returns a hex String representation of a Uint8Array
 * @param uint8Array
 * @returns {string}
 * @constructor
 */
const HexStringFromUint8Array = (uint8Array) => Buffer.from(uint8Array).toString("hex");

/**
 * returns a Uint8Array representation of a hex string
 * @param hexString
 * @returns {Uint8Array}
 * @constructor
 */
const Uint8ArrayFromHexString = (hexString) =>
  Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

/**
 *
 * @param object{Parse.ParseObject}
 * @return {Promise<void>}
 */
const restrictToMasterKeyOnly = async (object) => {
  const acl = new Parse.ACL();
  acl.setPublicReadAccess(false);
  acl.setPublicWriteAccess(false);
  object.setACL(acl, {});
  await object.save(null, { useMasterKey: true });
};

/**
 *
 * @param size
 * @returns {String}
 */
function generateRandomUrlBase64String(size) {
  return Crypto.randomBytes(size).toString("base64url");
}

module.exports = {
  Uint8ArrayFromHexString,
  HexStringFromUint8Array,
  restrictToMasterKeyOnly,
  generateRandomUrlBase64String,
};
