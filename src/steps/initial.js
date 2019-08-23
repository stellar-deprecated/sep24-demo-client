const Config = require("src/config");
const prop = require("lodash.get");
const toml = require("toml");

module.exports = {
  instruction: "Verify configuration variables",
  action: "GET /.well-known/stellar.toml (SEP-0001)",
  execute: async function(state, { request, response, instruction, expect }) {
    let HOME_DOMAIN = Config.get("HOME_DOMAIN");
    let WEB_AUTH_OVERRIDE = Config.get("WEB_AUTH_ENDPOINT");
    let TRANSFER_SERVER_OVERRIDE = Config.get("TRANSFER_SERVER");
    expect(
      HOME_DOMAIN || (WEB_AUTH_OVERRIDE && TRANSFER_SERVER_OVERRIDE),
      "Config needs either a HOME_DOMAIN or a WEB_AUTH_ENDPOINT and TRANSFER_SERVER",
    );
    if (WEB_AUTH_OVERRIDE) {
      instruction(
        "Overriding TOMLs WEB_AUTH_ENDPOINT via config: " + WEB_AUTH_OVERRIDE,
      );
      state.auth_endpoint = WEB_AUTH_OVERRIDE;
    }

    if (TRANSFER_SERVER_OVERRIDE) {
      instruction(
        "Overriding TOMLs TRANSFER_SERVER via config: " +
          TRANSFER_SERVER_OVERRIDE,
      );
      state.transfer_server = TRANSFER_SERVER_OVERRIDE;
    }
  },
};
