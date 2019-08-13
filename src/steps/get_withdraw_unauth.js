const StellarSDK = require("stellar-sdk");
const Config = require("../config");
const get = require("../util/get");

module.exports = {
  instruction:
    "In order to find out whether we need to enter the interactive or non-interactive flow, check the /withdraw endpoint",
  action: "GET /withdraw (SEP-0006)",
  execute: async function(state, { request, response, instruction }) {
    const ASSET_CODE = Config.get("ASSET_CODE");
    const USER_SK = Config.get("USER_SK");
    const pk = StellarSDK.Keypair.fromSecret(USER_SK).publicKey();
    const BRIDGE_URL = Config.get("BRIDGE_URL");
    const withdrawType = "cash";
    const params = {
      type: withdrawType,
      asset_code: ASSET_CODE,
      account: pk
    };
    request("GET /withdraw", params);
    // Expect this to fail with 403
    const result = await get(`${BRIDGE_URL}/withdraw`, params);
    response("GET /withdraw", result);
    instruction(
      "GET /withdraw tells us we need to collect info interactively.  The URL for the interactive portion is " +
        result.url
    );
    state.interactive_url = result.url;
  }
};
