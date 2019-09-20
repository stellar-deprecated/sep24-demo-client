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
      if (
        transactionResult.transaction.status === "pending_user_transfer_start"
      ) {
        instruction("Still pending user transfer, try again in 5s");
        setTimeout(poll, 5000);
      } else if (transactionResult.transaction.status !== lastStatus) {
        console.log(
          "Setting last status to ",
          transactionResult.transaction.status,
        );
        lastStatus = transactionResult.transaction.status;
        state.deposit_url = transactionResult.transaction.more_info_url;
        if (showingDepositView) setDevicePage(state.deposit_url);
      }
    };
    return new Promise((resolve, reject) => {
      poll();

      showClosePanel(true);
      setDevicePage(state.deposit_url);
      const cb = function(e) {
        if (e.data.message === "show-transaction") {
          setDevicePage(state.deposit_url);
          showingDepositView = true;
        } else if (e.data.message === "close-button") {
          showingDepositView = false;
          setDevicePage("pages/transactions.html?pending=true");
        }
      };
      window.addEventListener("message", cb);
    });
  },
};
