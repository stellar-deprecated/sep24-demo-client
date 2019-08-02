const Config = require("../config");
module.exports = {
  instruction:
    "We need to send the signed SEP10 challenge back to the server to get a JWT token to authenticate our stellar account with future actions",
  action: "Send signed response back to server",
  execute: async function(state, { log }) {
    const AUTH_URL = Config.get("AUTH_SERVER_URL");
    const transaction = state.signed_challenge_tx;
    const params = new URLSearchParams();
    params.set("transaction", transaction.toEnvelope().toXDR("base64"));
    log("POST /auth request with params:");
    log(params.toString());
    const response = await fetch(AUTH_URL, { method: "POST", body: params });
    const json = await response.json();
    log("POST /auth response");
    log(json);
    state.token = json.token;
  }
};
