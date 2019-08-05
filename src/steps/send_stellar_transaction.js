const StellarSdk = require("stellar-sdk");
const Config = require("../config");

module.exports = {
  instruction:
    "Now that the anchor is expecting payment to a stellar address, we need to make that payment",
  action: "Send the stellar payment",
  execute: async function(state, { log, instruction }) {
    const USER_SK = Config.get("USER_SK");
    const HORIZON_URI = Config.get("HORIZON_URI");
    const pk = StellarSdk.Keypair.fromSecret(USER_SK).publicKey();
    instruction("Send the payment using the following anchor account info");
    log({
      address: state.anchors_stellar_address,
      memo: state.stellar_memo,
      memo_type: state.stellar_memo_type
    });
    const server = new StellarSdk.Server(HORIZON_URI);
    const account = await server.loadAccount(pk);
    const fee = await server.fetchBaseFee();
    let memoBuffer = Buffer.alloc(32);
    let anchorMemoBuffer = Buffer.from(state.stellar_memo);
    // Sometimes the memo returned is only 31 bytes so we need to pad to exactly 32
    anchorMemoBuffer.copy(memoBuffer, 0, 0, 32);
    const transaction = new StellarSdk.TransactionBuilder(account, { fee })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: state.anchors_stellar_address,
          asset: StellarSdk.Asset.native(),
          amount: "100" // TODO send amount through
        })
      )
      .addMemo(StellarSdk.Memo.hash(anchorMemoBuffer))
      .setTimeout(30)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(USER_SK));
    const result = await server.submitTransaction(transaction);
  }
};
