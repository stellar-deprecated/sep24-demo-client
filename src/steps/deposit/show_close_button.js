module.exports = {
  instruction:
    "Let the user close the webapp to see the accounts list, and jump back to the deposit url",
  autoStart: true,
  execute: async function(
    state,
    { setDevicePage, showClosePanel, waitForPageMessage },
  ) {
    return new Promise((resolve, reject) => {
      const showClose = async () => {
        showClosePanel(true, () => {
          setDevicePage("pages/transactions.html?pending=true");
          showClosePanel(false);
        });
        await waitForPageMessage(state.deposit_url);
        showClose();
      };
      showClose();
    });
  },
};
