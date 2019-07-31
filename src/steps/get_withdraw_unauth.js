const get = require('../util/get')

const BRIDGE_URL = process.env.URL
const ASSET_CODE = process.env.ASSET_CODE
const USER_PK = process.env.USER_PK

module.exports = {
  instruction:
    "Client initiates a withdrawal. This should fail due to lack of authentication.",
  action: "GET /withdraw (sep6, unauthenticated)",
  execute: async function (state, { log, instruction }) {
    const withdrawType = "cash"
    const url = BRIDGE_URL + "/withdraw"
    const params = {
      type: withdrawType,
      asset_code: ASSET_CODE,
      account: USER_PK
    }
    log("GET /withdraw with params")
    log(params)
    // Expect this to fail with 403
    const result = await get(url, params)
    log("GET /withdraw response")
    log(result)
    instruction("GET /withdraw fails, we need to collect info interactively.  The URL for the interactive portion is " + result.url)
    state.interactive_url = BRIDGE_URL + result.url
  }
}