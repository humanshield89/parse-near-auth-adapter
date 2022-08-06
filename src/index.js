const { Uint8ArrayFromHexString, HexStringFromUint8Array } = require("./lib/Utils");

const { NearAuthAdapter } = require("./lib/NearAuthAdapter");
const { getNearSignToken } = require("./lib/CloudCode/NearAuthCloudCode");

exports.Uint8ArrayFromHexString = Uint8ArrayFromHexString;

exports.HexStringFromUint8Array = HexStringFromUint8Array;

exports.NearAuthAdapter = NearAuthAdapter;

exports.setupNearAuthAdapterCloudCode = () => {
  Parse.Cloud.define("getNearSignToken", getNearSignToken);
};
