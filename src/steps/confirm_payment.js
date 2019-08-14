module.exports = {
  instruction: "The user needs to confirm payment in the UI",
  action: "Confirm payment in the app",
  autoStart: true,
  execute: async function(state, { setDevicePage, waitForPageMessage }) {
    await waitForPageMessage("pages/confirm.html");
  },
};
