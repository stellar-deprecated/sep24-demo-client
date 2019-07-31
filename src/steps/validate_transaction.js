const get = require("../util/get");

const BRIDGE_URL = process.env.URL;
const ASSET_CODE = process.env.ASSET_CODE;
const USER_PK = process.env.USER_PK;

module.exports = {
	instruction:
		"Now that we have all the necessary KYC and transaction type info we can validate the transaction",
	action: "GET /withdraw (sep6, authenticated)",
	execute: async function(state, { log, instruction }) {
		const withdrawType = "cash";
		const url = BRIDGE_URL + "/withdraw";
		const params = {
			type: withdrawType,
			asset_code: ASSET_CODE,
			account: USER_PK
		};
		log("GET /withdraw with params");
		log(params);
		const result = await get(url, params);
		state.anchors_stellar_address = result.account_id;
		state.stellar_memo = result.memo;
		state.stellar_memo_type = result.memo_type;
		log("GET /withdraw response");
		log(result);
	}
};
