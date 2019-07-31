const Config = require("../config");
const StellarSdk = require("stellar-sdk");
StellarSdk.Network.useTestNetwork();

module.exports = {
  instruction:
    "We've received the JWT token we can use to authenticate our stellar account with the anchor's server.",
  action: "Launch interactive portion",
  execute: async function(state, { log, instruction }) {
    return new Promise((resolve, reject) => {
      const USER_PK = Config.get("USER_PK");
      // Add the parent_url so we can use postMessage inside the webapp
      const url =
        state.interactive_url +
        `?stellar_account=${USER_PK}&token=${state.token}&parent_url=${
          window.location.href
        }`;
      instruction(
        `Launching interactive webapp at ${url} and watching for postMessage callback`
      );
      const frame = document.createElement("iframe");
      frame.className = "appear";
      frame.width = 300;
      frame.height = 600;
      frame.src = url;
      document.body.appendChild(frame);
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
            removeIframe();
            resolve();
          }
        },
        false
      );

      function removeIframe() {
        frame.className = "disappear";
        setTimeout(() => {
          frame.parentNode.removeChild(frame);
        }, 300);
      }
    });
  }
};
