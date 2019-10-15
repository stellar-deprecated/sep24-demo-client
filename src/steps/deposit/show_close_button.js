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
