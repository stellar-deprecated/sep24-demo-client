const Config = require("../config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction:
    "To collect the interactive information we launch the interactive URL in a frame or webview, and await payment details from a postMessage callback",
  action: "Launch interactive portion",
  execute: async function(state, { log, instruction, setDevicePage }) {
    return new Promise((resolve, reject) => {
      // Add the parent_url so we can use postMessage inside the webapp
      const urlBuilder = new URL(state.interactive_url);
      urlBuilder.searchParams.set("jwt", state.token);
      const url = urlBuilder.toString();
      instruction(
        `Launching interactive webapp at ${url} and watching for postMessage callback`
      );
      setDevicePage(url);
      window.addEventListener(
        "message",
        function(e) {
          console.log("Message", e.data);
          if (e.data.type === "log") {
            log(e.data.message);
          }
          if (e.data.type === "log-object") {
            log(JSON.parse(e.data.obj));
          }
          if (e.data.type === "instruction") {
            instruction(e.data.message);
          }
          if (e.data.type === "success") {
            console.log(e.data);
            state.anchors_stellar_address = e.data.withdraw_anchor_account;
            state.stellar_memo = e.data.withdraw_memo;
            state.stellar_memo_type = e.data.withdraw_memo_type;
            resolve();
          }
        },
        false
      );
    });
  }
};
