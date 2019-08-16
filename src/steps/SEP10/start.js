const get = require("src/util/get");
const Config = require("src/config");
const StellarSDK = require("stellar-sdk");

module.exports = {
  instruction:
    "Start the SEP-0010 flow to authenticate the wallet's Stellar account",
  action: "GET /auth (SEP-0010)",
  execute: async function(state, { request, response, instruction, expect }) {
    const USER_SK = Config.get("USER_SK");
    const AUTH_URL = state.auth_server;
    const pk = StellarSDK.Keypair.fromSecret(USER_SK).publicKey();
    const params = { account: pk };
    request("GET /auth", params);
    const result = await get(AUTH_URL, params);
    response("GET /auth", result);

    expect(!!result.transaction, "The response didn't contain a transaction");
    const transactionObj = new StellarSDK.Transaction(
      result.transaction,
      StellarSDK.Networks.TESTNET,
    );
    expect(
      Number.parseInt(transactionObj.sequence) === 0,
      "Transaction sequence must be zero",
    );

    state.challenge_transaction = result.transaction;
  },
};
