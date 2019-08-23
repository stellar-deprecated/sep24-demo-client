module.exports = {
  instruction:
    "To collect the interactive information we launch the interactive URL in a frame or webview, and await payment details from a postMessage callback",
  action: "Launch interactive portion",
  execute: async function(
    state,
    { response, action, instruction, setDevicePage },
  ) {
    return new Promise((resolve, reject) => {
      // Add the parent_url so we can use postMessage inside the webapp
      const urlBuilder = new URL(state.interactive_url);
      if (state.token) {
        urlBuilder.searchParams.set("jwt", state.token);
      }
      const url = urlBuilder.toString();
      action(
        `Launching interactive webapp at ${url} and watching for postMessage callback`,
      );
      setDevicePage(url);
      window.addEventListener(
        "message",
        function(e) {
          if (e.data.type === "log") {
            instruction(e.data.message);
          }
          if (e.data.type === "log-object") {
            response("postMessage", JSON.parse(e.data.obj));
          }
          if (e.data.type === "instruction") {
            instruction(e.data.message);
          }
          if (e.data.type === "success") {
            response("postMessage success", e.data);
            state.deposit_url = e.data.more_info_url;
            resolve();
          }
          if (e.data.transaction) {
            response("received transaction data", e.data);
            state.transaction_id = e.data.transaction.id;
            resolve();
          }
        },
        false,
      );
    });
  },
};
