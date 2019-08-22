const StellarSdk = require("stellar-sdk");
const Config = require("src/config");
const get = require("src/util/get");

module.exports = {
  instruction:
    "We need to add a trustline to the asset to ensure the deposit will be expected",
  action: "Add Trustline",
  execute: async function(state, { request, expect }) {
    const USER_SK = Config.get("USER_SK");
    const HORIZON_URL = Config.get("HORIZON_URL");
    const ASSET_CODE = Config.get("ASSET_CODE");
    const pair = StellarSdk.Keypair.fromSecret(USER_SK);
    request("Adding a trustline", {
      asset_code: ASSET_CODE,
      issuer: state.asset_issuer,
    });
    const server = new StellarSdk.Server(HORIZON_URL);
    const account = await server.loadAccount(pair.publicKey());
    const feeStats = await get(`${HORIZON_URL}/fee_stats`);
    const asset = new StellarSdk.Asset(ASSET_CODE, state.asset_issuer);
    console.log(asset);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: feeStats.p70_accepted_fee,
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
