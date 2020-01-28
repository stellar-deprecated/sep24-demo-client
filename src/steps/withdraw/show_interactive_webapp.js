const Config = require("src/config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction:
    "To collect the interactive information we launch the interactive URL in a frame or webview, and await payment details from a postMessage callback",
  action: "Launch interactive portion",
  execute: async function(
    state,
    { response, action, instruction, setDevicePage, expect },
  ) {
    return new Promise((resolve, reject) => {
      // Add the parent_url so we can use postMessage inside the webapp
      const urlBuilder = new URL(state.interactive_url);
      urlBuilder.searchParams.set("jwt", state.token);
      urlBuilder.searchParams.set("callback", "postMessage");
      const url = urlBuilder.toString();
      action(
        `Launching interactive webapp at ${url} and watching for postMessage callback`,
      );
      const popup = window.open(url, "popup", "width=320,height=480");
      setDevicePage("pages/loader-with-popup-message.html");
      const cb = function(e) {
        let transaction = e.data.transaction;
        // Support older clients for now
        if (
          e.data.type === "success" ||
          e.data.status === "pending_user_transfer_start"
        ) {
          expect(
            false,
            "postMessage response should have the transaction in a transaction property, not top level.  Use the @stellar/anchor-transfer-utils helper to make this easier.",
          );
          transaction = e.data;
        }
        if (transaction) {
          expect(
            transaction.status === "pending_user_transfer_start",
            "Unknown transaction status: " + transaction.status,
          );
          response("postMessage: Interactive webapp completed", transaction);
          expect(
            transaction.withdraw_anchor_account,
            "withdraw_anchor_account undefined in postMessage callback",
          );
          expect(
            transaction.withdraw_memo,
            "withdraw_memo undefined in postMessage callback",
          );
          expect(
            transaction.withdraw_memo_type,
            "withdraw_memo_type undefined in postMessage callback.",
          );
          expect(
            transaction.id,
            "id is undefined in postMessage callback.  Falling back to using memo as ID, but this will be removed shortly.  Please send an explicit id field.",
          );
          state.anchors_stellar_address = transaction.withdraw_anchor_account;
          state.stellar_memo = transaction.withdraw_memo;
          state.stellar_memo_type = transaction.withdraw_memo_type;
          state.withdraw_amount = transaction.amount_in;
          state.transaction_id = transaction.id || state.stellar_memo;
          window.removeEventListener("message", cb);
          popup.close();
          resolve();
        }
        if (e.data.type === "log") {
          instruction(e.data.message);
        }
        if (e.data.type === "log-object") {
          response("postMessage", JSON.parse(e.data.obj));
        }
        if (e.data.type === "instruction") {
          instruction(e.data.message);
        }
      };
      window.addEventListener("message", cb, false);
    });
  },
};
