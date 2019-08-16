const StellarSDK = require("stellar-sdk");
const Config = require("src/config");
const get = require("src/util/get");
const crypto = require("crypto");

module.exports = {
  instruction:
    "In order to find out whether we need to enter the interactive or non-interactive flow, check the /deposit endpoint",
  action: "GET /deposit (SEP-0006)",
  execute: async function(state, { request, response, instruction, expect }) {
    const ASSET_CODE = Config.get("ASSET_CODE");
    const USER_SK = Config.get("USER_SK");
    const pk = StellarSDK.Keypair.fromSecret(USER_SK).publicKey();
    const BRIDGE_URL = Config.get("BRIDGE_URL");

    state.deposit_memo = crypto.randomBytes(64).toString("base64");
    state.deposit_memo_type = "hash";
    instruction(
      `We've created the deposit memo ${state.deposit_memo} to listen for a successful deposit`,
    );
    const params = {
      asset_code: ASSET_CODE,
      account: pk,
      memo: state.deposit_memo,
      memo_type: state.deposit_memo_type,
      type: "SPEI",
    };
    request("GET /deposit", params);
    // Expect this to fail with 403
    const result = await get(`${BRIDGE_URL}/deposit`, params, {
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    });
    response("GET /deposit", result);
    expect(
      result.type === "interactive_customer_info_needed",
      `Expected interactive customer needed, received ${result.type}`,
    );
    instruction(
      "GET /deposit tells us we need to collect info interactively.  The URL for the interactive portion is " +
        result.url,
    );
    state.interactive_url = result.url;
  },
};
