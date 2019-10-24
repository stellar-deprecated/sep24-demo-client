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
      action(`Showing the receipt for deposit at ${url}`);
      setDevicePage(state.deposit_url);
    });
  },
};
