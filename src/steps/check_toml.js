const Config = require("src/config");
const prop = require("lodash.get");
const toml = require("toml");

module.exports = {
  instruction:
    "Check the stellar.toml to find the necessary information about the transfer server",
  action: "GET /.well-known/stellar.toml (SEP-0001)",
  execute: async function(state, { request, response, instruction, expect }) {
    let HOME_DOMAIN = Config.get("HOME_DOMAIN");
    if (HOME_DOMAIN.indexOf("http") != 0) {
      HOME_DOMAIN = "https://" + HOME_DOMAIN;
    }
    request(`${HOME_DOMAIN}/.well-known/stellar.toml`);
    const resp = await fetch(`${HOME_DOMAIN}/.well-known/stellar.toml`);
    const text = await resp.text();
    const information = toml.parse(text);
    response(`${HOME_DOMAIN}/.well-known/stellar.toml`, information);
    expect(
      information.WEB_AUTH_ENDPOINT,
      "Toml file doesn't contain a WEB_AUTH_ENDPOINT",
    );
    expect(
      information.TRANSFER_SERVER,
      "Toml file doesn't contain a TRANSFER_SERVER",
    );
    state.auth_endpoint = information.WEB_AUTH_ENDPOINT;
    state.transfer_server = information.TRANSFER_SERVER;

    if (Config.get("WEB_AUTH_ENDPOINT")) {
      instruction(
        "Overriding TOMLs WEB_AUTH_ENDPOINT via config: " +
          Config.get("WEB_AUTH_ENDPOINT"),
      );
      state.auth_endpoint = Config.get("WEB_AUTH_ENDPOINT");
    }

    if (Config.get("TRANSFER_SERVER")) {
      instruction(
        "Overriding TOMLs TRANSFER_SERVER via config: " +
          Config.get("TRANSFER_SERVER"),
      );
      state.transfer_server = Config.get("TRANSFER_SERVER");
    }
  },
};
