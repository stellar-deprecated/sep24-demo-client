const StellarSDK = require("stellar-sdk");
const Config = require("src/config");
const get = require("src/util/get");

module.exports = {
  instruction:
    "To get the url for the interactive flow, check the /withdraw endpoint",
  action: "POST /transactions/withdraw/interactive (SEP-0024)",
  execute: async function(state, { request, response, instruction, expect }) {
    const ASSET_CODE = Config.get("ASSET_CODE");
    const USER_SK = Config.get("USER_SK");
    const pk = StellarSDK.Keypair.fromSecret(USER_SK).publicKey();
    const transfer_server = state.transfer_server;
    const params = {
      asset_code: ASSET_CODE,
      account: pk,
    };
    const email = Config.get("EMAIL_ADDRESS");
    if (email) {
      params.email_address = email;
    }
    request("POST /transactions/withdraw/interactive", params);
    const formData = new FormData();
    Object.keys(params).forEach((key) => formData.append(key, params[key]));
    const resp = await fetch(
      `${transfer_server}/transactions/withdraw/interactive`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
        body: formData,
      },
    );
    const result = await resp.json();
    response("POST /transactions/withdraw/interactive", result);
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
