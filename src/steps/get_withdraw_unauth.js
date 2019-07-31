const Config = require("../config");

const get = require("../util/get");

module.exports = {
  instruction:
    "Client initiates a withdrawal. This should fail due to lack of authentication.",
  action: "GET /withdraw (sep6, unauthenticated)",
  execute: async function(state, { log, instruction }) {
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
    // Expect this to fail with 403
    const result = await get("/withdraw", params);
    log("GET /withdraw response");
    log(result);
    instruction(
      "GET /withdraw fails, we need to collect info interactively.  The URL for the interactive portion is " +
        result.url
    );
    state.interactive_url = Config.get("BRIDGE_URL") + result.url;
  }
};
