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
      const url = urlBuilder.toString();
      action(
        `Launching interactive webapp at ${url} and watching for postMessage callback`,
      );
      setDevicePage(url);
      window.addEventListener(
        "message",
        function(e) {
          if (e.data.type === "log") {
            instruction(e.data.message);
          }
          if (e.data.type === "log-object") {
            response("postMessage", JSON.parse(e.data.obj));
          }
          if (e.data.type === "instruction") {
            instruction(e.data.message);
          }
          if (e.data.type === "success") {
            response("postMessage success", e.data);
            expect(
              e.data.withdraw_anchor_account,
              "withdraw_anchor_account undefined in postMessage success",
            );
            expect(
              e.data.withdraw_memo,
              "withdraw_memo undefined in postMessage success",
            );
            expect(
              e.data.withdraw_memo_type,
              "withdraw_memo_type undefined in postMessage success",
            );
            state.anchors_stellar_address = e.data.withdraw_anchor_account;
            state.stellar_memo = e.data.withdraw_memo;
            state.stellar_memo_type = e.data.withdraw_memo_type;
            state.withdraw_amount = e.data.amount_in;
            resolve();
          }
        },
        false,
      );
    });
  },
};
