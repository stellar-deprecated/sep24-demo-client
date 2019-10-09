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
    const transfer_server = state.transfer_server;

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
    };
    request("GET /deposit", params);
    // Expect this to fail with 403
    const url = new URL(`${transfer_server}/withdraw`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key]),
    );
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${state.token}`,
      },
    });
    expect(
      resp.status === 403,
      `GET /deposit should return a 403 status code when returning interactive_customer_info_needed, received ${resp.status}`,
    );
    const result = await resp.json();
    response("GET /deposit", result);
    expect(
      result.type === "interactive_customer_info_needed",
      `Expected interactive customer needed, received ${result.type}`,
    );
    instruction(
      "GET /deposit tells us we need to collect info interactively.  The URL for the interactive portion is " +
        result.url,
    );
    expect(result.url, "An interactive webapp URL is required");
    expect(
      result.url && result.url.indexOf("https://") === 0,
      "Interactive URLs (and all endpoints) must be served over https",
    );
    state.interactive_url = result.url;
  },
};
