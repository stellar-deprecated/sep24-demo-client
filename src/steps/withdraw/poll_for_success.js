const get = require("src/util/get");
const Config = require("src/config");

// TODO should this poll?
module.exports = {
  instruction: "Start polling the bridge for success",
  action: "GET /transaction (SEP6)",
  execute: async function(
    state,
    { request, response, instruction, error, expect, setDevicePage },
  ) {
    return new Promise((resolve, reject) => {
      const transfer_server = state.transfer_server;
      const poll = async () => {
        const transactionParams = {
          id: state.transaction_id,
        };
        request("GET /transaction", transactionParams);
        const transactionResult = await get(
          `${transfer_server}/transaction`,
          transactionParams,
          {
            headers: {
              Authorization: `Bearer ${state.token}`,
            },
          },
        );
        response("GET /transaction", transactionResult);
        if (transactionResult.transaction.status === "completed") {
          expect(
            transactionResult.transaction.external_transaction_id ||
              transactionResult.transaction.more_info_url,
            "Provide a more_info_url or external_transaction_id to show proper results",
          );
          state.external_transaction_id =
            transactionResult.transaction.external_transaction_id;
          instruction(
            "Success!  You can pick up your cash at a storefront with reference number " +
              state.external_transaction_id,
          );
          if (transactionResult.transaction.more_info_url) {
            const urlBuilder = new URL(
              transactionResult.transaction.more_info_url,
            );
            urlBuilder.searchParams.set("jwt", state.token);
            setDevicePage(urlBuilder.toString());
          } else {
            setDevicePage(
              "pages/receipt.html?reference_number=" +
                state.external_transaction_id,
            );
          }
          resolve();
        } else if (
          [
            "pending_external",
            "pending_anchor",
            "pending_stellar",
            "pending_user_transfer_start",
          ].indexOf(transactionResult.transaction.status) != -1
        ) {
          instruction(
            `Status is ${transactionResult.transaction.status}, lets retry in 2s`,
          );
          setTimeout(poll, 2000);
        } else {
          error(
            `Status is ${transactionResult.transaction.status}, something must have gone wrong`,
          );
        }
      };
      poll();
    });
  },
};
