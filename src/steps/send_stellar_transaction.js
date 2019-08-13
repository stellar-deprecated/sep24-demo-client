const StellarSdk = require("stellar-sdk");
const Config = require("../config");

const generateMemo = (stellar_memo, stellar_memo_type) => {
  let memo = null;
  switch (stellar_memo_type) {
    case "text":
      memo = StellarSdk.Memo.text(stellar_memo);
      break;
    case "hash":
      let memoBuffer = Buffer.alloc(32);
      let anchorMemoBuffer = Buffer.from(stellar_memo);
      // Sometimes the memo returned is smaller than 32 bytes so we need to pad to exactly 32
      anchorMemoBuffer.copy(memoBuffer, 0, 0, 32);
      memo = StellarSdk.Memo.hash(anchorMemoBuffer);
      break;
    case "id":
      memo = StellarSdk.Memo.id(stellar_memo);
      break;
  }
  return memo;
};

module.exports = {
  instruction:
    "Now that the anchor is expecting payment to a stellar address, we need to make that payment",
  action: "Send the stellar payment",
  execute: async function(state, { request }) {
    const USER_SK = Config.get("USER_SK");
    const HORIZON_URI = Config.get("HORIZON_URI");
    const pk = StellarSdk.Keypair.fromSecret(USER_SK).publicKey();
    request("Sending the payment using the following anchor account info", {
      address: state.anchors_stellar_address,
      memo: state.stellar_memo,
      memo_type: state.stellar_memo_type
    });
    const server = new StellarSdk.Server(HORIZON_URI);
    const account = await server.loadAccount(pk);
    const fee = await server.fetchBaseFee();

    let memo;
    try {
      memo = generateMemo(state.stellar_memo, state.stellar_memo_type);
    } catch (e) {
      expect(
        false,
        `The memo '${state.stellar_memo} could not be encoded to type ${
          state.stellar_memo_type
        }`
      );
    }

    const transaction = new StellarSdk.TransactionBuilder(account, { fee })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: state.anchors_stellar_address,
          asset: StellarSdk.Asset.native(),
          amount: "100" // TODO send amount through
        })
      )
      .addMemo(memo)
      .setTimeout(30)
      .build();
    transaction.sign(StellarSdk.Keypair.fromSecret(USER_SK));
    await server.submitTransaction(transaction);
  }
};
