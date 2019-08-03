const Config = require("../config");
const get = require("../util/get");

module.exports = {
  instruction:
    "In order to find out whether we need to enter the interactive or non-interactive flow, check the /withdraw endpoint",
  action: "GET /withdraw (SEP-0006)",
  execute: async function(state, { log, instruction }) {
    const ASSET_CODE = Config.get("ASSET_CODE");
    const USER_PK = Config.get("USER_PK");
    const BRIDGE_URL = Config.get("BRIDGE_URL");
    const withdrawType = "cash";
    const params = {
      type: withdrawType,
      asset_code: ASSET_CODE,
      account: USER_PK
    };
    log("GET /withdraw with params");
    log(params);
    // Expect this to fail with 403
    const result = await get(`${BRIDGE_URL}/withdraw`, params);
    log("GET /withdraw response");
    log(result);
    instruction(
      "GET /withdraw tells us we need to collect info interactively.  The URL for the interactive portion is " +
        result.url
    );
    state.interactive_url = result.url;
  }
};
