/**
 * @param req {Parse.Cloud.FunctionRequest}
 */
const { NearSignToken } = require("../data/NearSignToken/class");

const getNearSignToken = async (req) => {
  const { walletId } = req.params;
  if (!walletId) throw new Parse.Error();

  const obj = await NearSignToken.generateNew(walletId);

  return {
    status: "success",
    data: obj.linkedObject,
  };
};

module.exports = {
  getNearSignToken,
};
