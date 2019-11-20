const StellarSDK = require("stellar-sdk");
const Config = require("src/config");
const get = require("src/util/get");

module.exports = {
  instruction:
    "In order to find out whether we need to enter the interactive or non-interactive flow, check the /withdraw endpoint",
  action: "GET /withdraw (SEP-0006)",
  execute: async function(state, { request, response, instruction, expect }) {
    const ASSET_CODE = Config.get("ASSET_CODE");
    const USER_SK = Config.get("USER_SK");
    const pk = StellarSDK.Keypair.fromSecret(USER_SK).publicKey();
    const transfer_server = state.transfer_server;
    const params = {
      asset_code: ASSET_CODE,
      account: pk,
    };
    request("GET /withdraw", params);
    // Expect this to fail with 403
    const result = await get(`${transfer_server}/withdraw`, params, {
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    });
    response("GET /withdraw", result);
    expect(
      result.type == "interactive_customer_info_needed",
      "The only supported type is interactive_customer_info_needed",
    );
    expect(result.url, "An interactive webapp URL is required");
    if (Config.get("PUBNET")) {
      expect(
        result.url && result.url.indexOf("https://") === 0,
        "Interactive URLs (and all endpoints) must be served over https",
      );
    }
    instruction(
      "GET /withdraw tells us we need to collect info interactively.  The URL for the interactive portion is " +
        result.url,
    );
    state.interactive_url = result.url;
  },
};
