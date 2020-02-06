const StellarSdk = require("stellar-sdk");
const Config = require("src/config");
const get = require("src/util/get");

module.exports = {
  instruction:
    "We need to add a trustline to the asset to ensure the deposit will be expected",
  action: "Add Trustline",
  execute: async function(state, { instruction, request, expect }) {
    const USER_SK = Config.get("USER_SK");
    const HORIZON_URL = Config.get("HORIZON_URL");
    const ASSET_CODE = Config.get("ASSET_CODE");
    const pair = StellarSdk.Keypair.fromSecret(USER_SK);

    const server = new StellarSdk.Server(HORIZON_URL);
    const account = await server.loadAccount(pair.publicKey());
    request("Fetching account to see if there is a trustline", account);
    if (
      account.balances.find(
        (balance) =>
          balance.asset_issuer == state.asset_issuer &&
          balance.asset_code == ASSET_CODE,
      )
    ) {
      instruction(
        "There is already a trustline on this account, no need to recreate it",
      );
      return;
    }
    instruction(
      "There isn't currently a trustline on this account so we need to add one",
    );
    request("Adding a trustline", {
      asset_code: ASSET_CODE,
      issuer: state.asset_issuer,
    });
    const feeStats = await get(`${HORIZON_URL}/fee_stats`);
    const asset = new StellarSdk.Asset(ASSET_CODE, state.asset_issuer);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: feeStats.max_fee.p70,
      networkPassphrase: state.network,
    })
      .addOperation(
        StellarSdk.Operation.changeTrust({
          asset,
        }),
      )
      .setTimeout(30)
      .build();
    transaction.sign(pair);
    await server.submitTransaction(transaction);
  },
};
