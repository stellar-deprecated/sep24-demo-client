const get = require("../util/get");
const Config = require("../config");

module.exports = {
  instruction:
    "Before we launch the interactive portion, the client app should negotiate SEP10 authentication",
  action: "GET /auth (sep10)",
  execute: async function(state, { log, instruction }) {
    const USER_PK = Config.get("USER_PK");
    const params = { account: USER_PK };
    log("GET /auth request with params:");
    log(params);
    const response = await get("/auth", params);
    log("GET /auth response");
    log(response);
    state.challenge_transaction = response.transaction;
  }
};
