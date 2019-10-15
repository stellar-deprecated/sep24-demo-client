const Config = require("src/config");
const get = require("src/util/get");
const prop = require("lodash.get");

module.exports = {
  instruction: "Check /info endpoint to see if we need to authenticate",
  action: "GET /info (SEP-0006)",
  execute: async function(state, { request, response, instruction, expect }) {
    const transfer_server = state.transfer_server;
    request("GET /info");
    const result = await get(`${transfer_server}/info`);
    response("GET /info response", result);
    expect(
      prop(result, ["withdraw", Config.get("ASSET_CODE"), "enabled"]),
      `${Config.get("ASSET_CODE")} is not enabled for withdraw`,
    );
    instruction(
      "Withdraw is enabled, and requires authentication so we should go through SEP-0010",
    );

    state.interactive_url = transfer_server + result.url;
  },
};
