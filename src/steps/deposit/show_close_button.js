const Config = require("src/config");
const StellarSdk = require("stellar-sdk");
const get = require("src/util/get");

module.exports = {
  instruction:
    "Let the user close the webapp to see the accounts list, and jump back to the deposit url",
  autoStart: true,
  execute: async function(
    state,
    { request, response, expect, instruction, setDevicePage, showClosePanel },
  ) {
    let lastStatus = "pending_user_transfer_start";
    let showingDepositView = true;
    const poll = async () => {
      const transfer_server = state.transfer_server;
      const transactionParams = {
        id: state.transaction_id,
      };
      request("GET /transaction", transactionParams);
      const transactionResult = await get(
        `${transfer_server}/transaction`,
        transactionParams,
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        },
      );
      response("GET /transaction", transactionResult);

      const HORIZON_URL = Config.get("HORIZON_URL");
      const sk = Config.get("USER_SK");
      const pair = StellarSdk.Keypair.fromSecret(sk);
      console.log("Wallet address: ", pair.publicKey());
      const signersResult = await get(
        `${HORIZON_URL}/accounts?signer=${pair.publicKey()}`,
      );

      const claimableAccount = signersResult._embedded.records[0];
      if (claimableAccount) {
        instruction(
          "Found a claimable account: " + claimableAccount.account_id,
        );
        await claimAccount(
          pair,
          claimableAccount.id,
          state.asset_issuer,
          instruction,
        );
      }

      if (lastStatus !== transactionResult.transaction.status) {
        lastStatus = transactionResult.transaction.status;
        instruction(`Status updated to ${lastStatus}`);
        const urlBuilder = new URL(transactionResult.transaction.more_info_url);
        urlBuilder.searchParams.set("jwt", state.token);
        state.deposit_url = urlBuilder.toString();
        if (showingDepositView) {
          showDepositView();
        }
      }
      if (transactionResult.transaction.status !== "completed") {
        instruction(
          `Still ${transactionResult.transaction.status}, try again in 5s`,
        );
        setTimeout(poll, 5000);
      }
    };

    function showDepositView() {
      showingDepositView = true;
      setDevicePage(state.deposit_url);
      showClosePanel();
    }

    function showTransactionsView() {
      showingDepositView = false;
      setDevicePage("pages/transactions.html?pending=true");
    }

    return new Promise((resolve, reject) => {
      poll();

      showDepositView();
      const cb = function(e) {
        if (e.data.message === "show-transaction") {
          showDepositView();
        } else if (e.data.message === "close-button") {
          showTransactionsView();
        }
      };
      window.addEventListener("message", cb);
    });
  },
};

async function claimAccount(
  mainAccountPair,
  claimableAccountId,
  issuer,
  instruction,
) {
  const HORIZON_URL = Config.get("HORIZON_URL");
  const ASSET_CODE = Config.get("ASSET_CODE");
  const asset = new StellarSdk.Asset(ASSET_CODE, issuer);
  const server = new StellarSdk.Server(HORIZON_URL);
  const mainPK = mainAccountPair.publicKey();
  const claimableAccount = await server.loadAccount(claimableAccountId);
  const balance = claimableAccount.balances.find(
    (b) => b.asset_code === ASSET_CODE && b.asset_issuer === issuer,
  );
  console.log(balance);
  const amount = balance.balance;
  const { p90_accepted_fee: fee } = await server.feeStats();
  const builder = new StellarSdk.TransactionBuilder(claimableAccount, {
    fee,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });
  let needsTrustline = true;
  try {
    let claimingAccount = await server.loadAccount(mainPK);
    needsTrustline = !claimingAccount.balances.find(
      (b) => b.asset_code === ASSET_CODE && b.asset_issuer === issuer,
    );
  } catch (e) {
    instruction("The main account doesn't exist so we need to create it");
    builder.addOperation(
      StellarSdk.Operation.createAccount({
        destination: mainPK,
        startingBalance: "10.0",
      }),
    );
  }
  if (!needsTrustline) {
    instruction("Pay 0.5xlm in order to pay for the operations needed");
    builder.addOperation(
      StellarSdk.Operation.payment({
        asset: StellarSdk.Asset.native(),
        amount: "0.5",
        source: claimableAccountId,
        destination: mainPK,
      }),
    );
  } else {
    instruction(
      "Pay 0.5xlm in order to pay for the operations needed, including a trustline",
    );
    builder.addOperation(
      StellarSdk.Operation.payment({
        asset: StellarSdk.Asset.native(),
        amount: "1.0",
        source: claimableAccountId,
        destination: mainPK,
      }),
    );
    builder.addOperation(
      StellarSdk.Operation.changeTrust({
        asset,
        source: mainPK,
      }),
    );
  }
  instruction("Use a payment to transfer the actual assets");
  builder.addOperation(
    StellarSdk.Operation.payment({
      asset,
      destination: mainPK,
      amount,
    }),
  );
  instruction(
    "Remove the trustline of the asset from the intermediate account so it can be merged to the main account",
  );
  builder.addOperation(
    StellarSdk.Operation.changeTrust({
      asset,
      limit: "0",
    }),
  );
  instruction(
    "Merge the intermediate account into the main account to absorb any leftover lumens",
  );
  builder.addOperation(
    StellarSdk.Operation.accountMerge({
      destination: mainPK,
    }),
  );
  const tx = builder.setTimeout(100).build();
  tx.sign(mainAccountPair);
  const result = await server.submitTransaction(tx);
  console.log("Success???", result);
}
