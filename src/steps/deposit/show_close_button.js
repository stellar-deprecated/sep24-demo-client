const get = require("src/util/get");
const StellarSdk = require("stellar-sdk");
const Config = require("src/config");

async function addTrustline(state, instruction, request, expect) {
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
}

module.exports = {
  instruction:
    "Let the user close the webapp to see the accounts list, and jump back to the deposit url",
  autoStart: true,
  execute: async function(
    state,
    { request, response, expect, instruction, setDevicePage },
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

      if (lastStatus !== transactionResult.transaction.status) {
        lastStatus = transactionResult.transaction.status;
        instruction(`Status updated to ${lastStatus}`);
        if (lastStatus === "pending_trust") {
          let resp = await addTrustline(state, instruction, request, expect);
        }
        const urlBuilder = new URL(transactionResult.transaction.more_info_url);
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
      if (state.popup.closed) {
        state.popup = window.open(
          state.deposit_url,
          "popup",
          "width=320,height=480",
        );
      } else {
        state.popup.window.location = state.deposit_url;
      }
      const timer = setInterval(() => {
        if (state.popup.closed) {
          clearInterval(timer);
          showTransactionsView();
        }
      }, 100);
      setDevicePage("pages/loader-with-popup-message.html");
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
