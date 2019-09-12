module.exports = {
  instruction: "Let the user close the webapp to see the accounts list",
  autoStart: true,
  execute: async function(
    state,
    {
      response,
      action,
      instruction,
      setDevicePage,
      showClosePanel,
      waitForPageMessage,
    },
  ) {
    return new Promise((resolve, reject) => {
      const showClose = async () => {
        showClosePanel(true, () => {
          setDevicePage("pages/transactions.html");
          showClosePanel(false);
        });
        await waitForPageMessage(state.deposit_url);
        showClose();
      };
      showClose();
    });
  },
};
