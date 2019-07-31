const get = require("../util/get")

const BRIDGE_URL = process.env.URL
const ASSET_CODE = process.env.ASSET_CODE
const USER_PK = process.env.USER_PK

module.exports = {
  instruction:
    "Before we launch the interactive portion, the client app should negotiate SEP10 authentication",
  action: "GET /auth (sep10)",
  execute: async function (state, { log, instruction }) {
    const url = BRIDGE_URL + "/auth"
    const params = { account: USER_PK }
    log("GET /auth request with params:")
    log(params)
    const response = await get(url, params)
    log("GET /auth response")
    log(response)
    state.challenge_transaction = response.transaction
  }
}