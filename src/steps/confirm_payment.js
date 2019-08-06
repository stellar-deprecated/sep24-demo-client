module.exports = {
  instruction: "The user needs to confirm payment in the UI",
  action: "Confirm payment in the app",
  execute: async function(state, { setDevicePage, waitForPageContinue }) {
    return waitForPageContinue("pages/confirm.html");
  }
};
