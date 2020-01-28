const Config = require("src/config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction:
    "To collect the interactive information we launch the interactive URL in a frame or webview, and await payment details from a postMessage callback",
  action: "Launch interactive portion",
  execute: async function(
    state,
    { response, action, instruction, expect, setDevicePage },
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
      state.popup = window.open(url, "popup", "width=320,height=480");
      setDevicePage("pages/loader-with-popup-message.html");
      window.addEventListener(
        "message",
        function(e) {
          let transaction = e.data.transaction;
          // Support older clients for now
          if (e.data.type === "success" || e.data.status === "completed") {
            expect(
              false,
              "postMessage response should have the transaction in a transaction property, not top level.",
            );
            transaction = e.data;
          }
          if (transaction) {
            expect(
              transaction.status === "completed" ||
                transaction.status === "pending_external" ||
                transaction.status === "pending_anchor" ||
                transaction.status === "pending_stellar" ||
                transaction.status === "pending_user_transfer_start",
              "Unknown transaction status: " + transaction.status,
            );
            response("postMessage: Interactive webapp completed", transaction);
            expect(
              transaction.more_info_url,
              "postMessage callback must contain a more_info_url with information on how to finish the deposit",
            );
            expect(
              transaction.id,
              "postMessage callback transaction contains no id",
            );
            const urlBuilder = new URL(transaction.more_info_url);
            urlBuilder.searchParams.set("jwt", state.token);
            state.deposit_url = urlBuilder.toString();
            state.transaction_id = transaction.id;
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
        },
        false,
      );
    });
  },
};
