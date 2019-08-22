const Config = require("src/config");
const StellarSdk = require("stellar-sdk");

module.exports = {
  instruction: "Launch the current state of the deposit",
  action: "Launch deposit information",
  autoStart: true,
  execute: async function(
    state,
    { response, action, instruction, setDevicePage },
  ) {
    return new Promise((resolve, reject) => {
      // Add the parent_url so we can use postMessage inside the webapp
      const urlBuilder = new URL(state.deposit_url);
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
            state.deposit_url = e.data.more_info_url;
            resolve();
          }
        },
        false,
      );
    });
  },
};
