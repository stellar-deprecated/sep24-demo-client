const Config = require("../config");

module.exports = {
  instruction:
    "The flow is kicked off when someone has a credit backed by an Anchor supporting SEP-0006.  A withdraw cash button will appear near their balance.",
  action: "Open the app",
  autoStart: true,
  execute: async function(state, { log, instruction, waitForPageContinue }) {
    return waitForPageContinue("pages/wallet.html");
  }
};
