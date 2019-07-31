import "./style.css";
import * as uiActions from "./ui/ui-actions";
const Config = require("./config");

Config.installUI(document.querySelector("#config-form"));
if (!Config.isValid()) {
  uiActions.showConfig();
}
window.Config = Config;

const BRIDGE_URL = Config.get("BRIDGE_URL");
fetch(BRIDGE_URL + "/reset", { method: "POST" });

/**
 * State maintained between steps
 * @typedef {Object} State
 * @property {string} interactive_url - URL hosting the interactive webapp step
 * @property {string} challenge_transaction - XDR Representation of Stellar challenge transaction signed by server only
 * @property {Object} signed_challenge_tx - Stellar transaction challenge signed by both server and client
 * @property {string} token - JWT token representing authentication with stellar address from SEP10
 * @property {string} anchors_stellar_address - Address that the anchor will be expecting payment on for the in-flight transaction
 * @property {string} stellar_memo_type - Memo type for the stellar transaction to specify the anchor's transaction
 * @property {string} stellar_memo - Memo required for the specified stellar transaction
 * @property {string} external_transaction_id - The reference identifier needed to retrieve or confirm the withdrawal
 */

/**
 * @type State
 */
const state = {};

const steps = [
  require("./steps/get_withdraw_unauth"),
  require("./steps/start_sep10"),
  require("./steps/sign_sep10"),
  require("./steps/send_challenge_sep10"),
  require("./steps/show_interactive_webapp"),
  require("./steps/validate_transaction"),
  require("./steps/send_stellar_transaction"),
  require("./steps/poll_for_success")
];

let currentStep = null;
const runStep = step => {
  if (!step) {
    uiActions.setAction("Finished");
    uiActions.setLoading(true, "Finished");
    return;
  }
  uiActions.instruction(step.instruction);
  uiActions.setAction(step.action);
  currentStep = step;
};

const next = async () => {
  if (currentStep && currentStep.execute) {
    uiActions.setLoading(true);
    try {
      await currentStep.execute(state, uiActions);
      steps.splice(0, 1);
    } catch (e) {
      uiActions.error(e);
      uiActions.setLoading(false);
      throw e;
    }

    uiActions.setLoading(false);
  }
  runStep(steps[0]);
};
next();
uiActions.actionButton.addEventListener("click", next);
