const Config = require("src/config");
module.exports = {
  instruction:
    "We need to send the signed SEP10 challenge back to the server to get a JWT token to authenticate our stellar account with future actions",
  action: "Send signed response back to server",
  execute: async function(state, { request, response, expect }) {
    const AUTH_URL = state.auth_endpoint;
    const transaction = state.signed_challenge_tx;
    const params = {
      transaction: transaction.toEnvelope().toXDR("base64"),
    };
    request("POST /auth", params);
    const result = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    const json = await result.json();
    response("POST /auth", json);
    expect(json.token, "No token returned from /auth");
    state.token = json.token;
    console.log("Token is ", state.token);
  },
};
