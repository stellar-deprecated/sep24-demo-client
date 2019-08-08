const get = require("../util/get");
const Config = require("../config");
const StellarSDK = require("stellar-sdk");

module.exports = {
  instruction:
    "Start the SEP-0010 flow to authenticate the wallet's Stellar account",
  action: "GET /auth (SEP-0010)",
  execute: async function(state, { log, instruction, expect }) {
    const USER_SK = Config.get("USER_SK");
    const AUTH_URL = Config.get("AUTH_SERVER_URL");
    const pk = StellarSDK.Keypair.fromSecret(USER_SK).publicKey();
    const params = { account: pk };
    log("GET /auth request with params:");
    log(params);
    const response = await get(AUTH_URL, params);
    log("GET /auth response");
    log(response);

    expect(!!response.transaction, "The response didn't contain a transaction");
    const transactionObj = new StellarSDK.Transaction(
      response.transaction,
      StellarSDK.Networks.TESTNET
    );
    expect(
      Number.parseInt(transactionObj.sequence) === 0,
      "Transaction sequence must be zero"
    );

    state.challenge_transaction = response.transaction;
  }
};
