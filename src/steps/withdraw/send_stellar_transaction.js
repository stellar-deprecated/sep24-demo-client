const StellarSdk = require("stellar-sdk");
const Config = require("src/config");
const get = require("src/util/get");

module.exports = {
  instruction:
    "Now that the anchor is expecting payment to a stellar address, we need to make that payment",
  action: "Send the stellar payment",
  execute: async function(state, { request, expect }) {
    const USER_SK = Config.get("USER_SK");
    const HORIZON_URL = Config.get("HORIZON_URL");
    const ASSET_CODE = Config.get("ASSET_CODE");
    const pk = StellarSdk.Keypair.fromSecret(USER_SK).publicKey();
    request("Sending the payment using the following anchor account info", {
      address: state.anchors_stellar_address,
      memo: state.stellar_memo,
      memo_type: state.stellar_memo_type,
    });
    const server = new StellarSdk.Server(HORIZON_URL);
    const account = await server.loadAccount(pk);
    const feeStats = await get(`${HORIZON_URL}/fee_stats`);
    let memo;
    try {
      const memoType = {
        text: StellarSdk.Memo.text,
        id: StellarSdk.Memo.id,
        hash: StellarSdk.Memo.hash,
      }[state.stellar_memo_type];
      memo = memoType(state.stellar_memo);
    } catch (e) {
      expect(
        false,
        `The memo '${state.stellar_memo}' could not be encoded to type ${state.stellar_memo_type}`,
      );
    }

    const asset = new StellarSdk.Asset(ASSET_CODE, state.asset_issuer);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: feeStats.p70_accepted_fee * 2,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: state.anchors_stellar_address,
          asset: asset,
          amount: "100", // TODO send amount through
        }),
      )
      .addMemo(memo)
      .setTimeout(30)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(USER_SK));
    await server.submitTransaction(transaction);
  },
};
