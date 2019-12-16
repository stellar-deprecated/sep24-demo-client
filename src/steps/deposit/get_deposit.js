const StellarSDK = require("stellar-sdk");
const Config = require("src/config");
const crypto = require("crypto");

module.exports = {
  instruction:
    "To get the url for the interactive flow check the /transactions/deposit/interactive endpoint",
  action: "POST /transactions/deposit/interactive (SEP-0024)",
  execute: async function(state, { request, response, instruction, expect }) {
    const ASSET_CODE = Config.get("ASSET_CODE");
    const USER_SK = Config.get("USER_SK");
    const pk = StellarSDK.Keypair.fromSecret(USER_SK).publicKey();
    const transfer_server = state.transfer_server;

    state.deposit_memo = crypto.randomBytes(32).toString("base64");
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
    const email = Config.get("EMAIL_ADDRESS");
    if (email) {
      params.email_address = email;
    }
    request("POST /transactions/deposit/interactive", params);
    const formData = new FormData();
    Object.keys(params).forEach((key) => formData.append(key, params[key]));
    const resp = await fetch(
      `${transfer_server}/transactions/deposit/interactive`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
        body: formData,
      },
    );
    const result = await resp.json();
    response("POST /transactions/deposit/interactive", result);
    expect(
      result.type === "interactive_customer_info_needed",
      `Expected interactive customer needed, received ${result.type}`,
    );
    instruction(
      "POST /deposit tells us we need to collect info interactively.  The URL for the interactive portion is " +
        result.url,
    );
    expect(result.url, "An interactive webapp URL is required");
    if (Config.get("PUBNET")) {
      expect(
        result.url && result.url.indexOf("https://") === 0,
        "Interactive URLs (and all endpoints) must be served over https",
      );
    }
    state.interactive_url = result.url;
  },
};
