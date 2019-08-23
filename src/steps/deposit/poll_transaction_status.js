const Config = require("src/config");
const StellarSdk = require("stellar-sdk");
const get = require("src/util/get");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  instruction: "Poll the /transaction endpoint to validate transaction status",
  action: "Start polling",
  execute: async function(
    state,
    { request, response, instruction, setDevicePage },
  ) {
    return new Promise(async (resolve, reject) => {
      // Launch a while(true) functon, that runs the following
      // 1. Hit /transaction?id=<id>
      // 2. Check the transaction status.
      //   2.a If status = pending_external, call confirm_transaction
      //   2.b If status = pending_trust, create trustline
      //   2.c If status = completed, great success!
      const ASSET_CODE = Config.get("ASSET_CODE");
      const ASSET_ISSUER_KEY = Config.get("ASSET_ISSUER_KEY");
      const HORIZON_URL = Config.get("HORIZON_URL");
      const USER_SK = Config.get("USER_SK");
      const transfer_server = state.transfer_server;
      const params = {
        id: state.transaction_id,
      };
      let trustline_created = false;

      while (true) {
        request("GET /transaction", params);
        const result = await get(`${transfer_server}/transaction`, params);
        response("GET /transaction", result);
        const status = result.transaction.status;

        if (status == "pending_external") {
          //
          // Anchor is waiting for an external transaction to happen.
          //
          instruction(
            "[Warning: non-sep6 endpoint] Result is pending_external. Confirming transaction via dummy endpoint",
          );
          const confirm_params = {
            transaction_id: state.transaction_id,
            amount: result.transaction.amount_in,
          };
          request("GET /deposit/confirm_transaction/", confirm_params);
          const confirm_result = await get(
            `${transfer_server}/deposit/confirm_transaction/`,
            confirm_params,
          );
          response("GET /deposit/confirm_transaction/", confirm_result);
        } else if (status == "pending_trust") {
          //
          // Anchor is waiting on the trustline creation to fulfill the deposit.
          //
          if (!trustline_created) {
            instruction("We should establish a trustline");
            const pk = StellarSdk.Keypair.fromSecret(USER_SK).publicKey();
            const server = new StellarSdk.Server(HORIZON_URL);
            const account = await server.loadAccount(pk);
            const feeStats = await get(`${HORIZON_URL}/fee_stats`);
            const asset = new StellarSdk.Asset(ASSET_CODE, ASSET_ISSUER_KEY);
            const transaction = new StellarSdk.TransactionBuilder(account, {
              fee: feeStats.p70_accepted_fee * 2,
            })
              .addOperation(StellarSdk.Operation.changeTrust({ asset }))
              .setTimeout(30)
              .build();
            transaction.sign(StellarSdk.Keypair.fromSecret(USER_SK));
            request("Submit Trustline Creation to Stellar Network");
            const resp = await server.submitTransaction(transaction);
            response("Submit Trustline Creation to Stellar Network", resp);
            trustline_created = true;
          } else {
            instruction(
              "Trustline already created. Waiting for server to process trustline.",
            );
          }
        } else if (status == "pending_anchor") {
          //
          // Anchor is processing the transaction internally.
          //
          instruction("Waiting for anchor to process transaction");
        } else if (status == "completed") {
          //
          // Deposit went through sucessfully.
          //
          const amount = `${result.transaction.amount_out} ${ASSET_CODE}`;
          instruction("Success! Transaction is completed");
          setDevicePage(
            `pages/deposit-receipt.html?amount=${amount}&reference_number=${state.transaction_id}`,
          );
          break;
        } else {
          instruction(`Unhandled transaction status: ${status}`);
          break;
        }
        instruction("Waiting 10 seconds and checking again.");
        await sleep(10000);
      }
      resolve();
    });
  },
};
