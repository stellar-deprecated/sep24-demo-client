const get = require("../util/get");
const Config = require("../config");
const StellarSDK = require("stellar-sdk");

module.exports = {
  instruction: "Deposit flow is not implemented yet",
  action: "Try anyway",
  execute: async function(state, { log, expect }) {
    expect(false, "Seriously its not implemented");
  }
};
