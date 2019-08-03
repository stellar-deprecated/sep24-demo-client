const Config = require("../config");
const get = require("../util/get");

module.exports = {
  instruction: "Check /info endpoint to see if we need to authenticate",
  action: "GET /info (SEP-0006)",
  execute: async function(state, { log, instruction }) {
    const BRIDGE_URL = Config.get("BRIDGE_URL");
    log("GET /info");
    const result = await get(`${BRIDGE_URL}/info`);
    log("GET /info response");
    log(result);
    instruction(
      "Withdraw is enabled, and requires authentication so we should go through SEP-0010"
    );
    state.interactive_url = Config.get("BRIDGE_URL") + result.url;
  }
};
