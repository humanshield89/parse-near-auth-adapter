const { WrappedBaseParseObjStruct } = require("../WrappedBaseParseObj/struct");
module.exports.NearSignNonceStruct = {
  className: "NearSignToken",
  token: "token",
  walletId: "walletId",
  ...WrappedBaseParseObjStruct,
};
