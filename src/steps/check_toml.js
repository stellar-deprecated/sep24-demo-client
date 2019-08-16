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
    expect(information.AUTH_SERVER, "Toml file doesn't contain an AUTH_SERVER");
    expect(
      information.TRANSFER_SERVER,
      "Toml file doesn't contain a TRANSFER_SERVER",
    );
    state.auth_server = information.AUTH_SERVER;
    state.transfer_server = information.TRANSFER_SERVER;
  },
};
