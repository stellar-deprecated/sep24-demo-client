const get = require("../util/get");
const Config = require("../config");

module.exports = {
  instruction:
    "Now that we have all the necessary KYC and transaction type info we can validate the transaction",
  action: "GET /withdraw (sep6, authenticated)",
  execute: async function(state, { log }) {
    const ASSET_CODE = Config.get("ASSET_CODE");
    const USER_PK = Config.get("USER_PK");
    const withdrawType = "cash";
    const params = {
      type: withdrawType,
      asset_code: ASSET_CODE,
      account: USER_PK
    };
    log("GET /withdraw with params");
    log(params);
    const result = await get("/withdraw", params);
    state.anchors_stellar_address = result.account_id;
    state.stellar_memo = result.memo;
    state.stellar_memo_type = result.memo_type;
    log("GET /withdraw response");
    log(result);
  }
};
