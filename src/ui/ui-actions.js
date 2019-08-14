const Renderjson = require("renderjson");
Renderjson.set_show_to_level(1);

const $ = (id) => document.getElementById(id);

const section = $("instructions-section");
const container = $("instructions-container");
const actionButton = $("action-button");
const configButton = $("config-button");
const configPanel = $("config-panel");
const deviceFrame = $("device-frame");

configButton.addEventListener("click", () => {
  configPanel.classList.toggle("visible");
});
configPanel.querySelector("#close-button").addEventListener("click", () => {
  configPanel.classList.toggle("visible");
});

const showConfig = () => {
  configPanel.classList.add("visible");
};

const scrollToTop = () => (section.scrollTop = section.scrollHeight);

const addEntry = (message, className) => {
  const div = document.createElement("div");
  div.textContent = message;
  div.className = className + " log-entry";
  container.appendChild(div);
  scrollToTop();
};
const action = (message) => addEntry(message, "action");
const instruction = (instruction) => addEntry(instruction, "instruction");

const logObject = (message, params, className = "informational") => {
  const div = document.createElement("div");
  div.className = `detail log-entry ${className}`;
  const title = document.createElement("div");
  title.className = "detail-title";
  title.textContent = message;
  div.appendChild(title);
  if (params) {
    const body = document.createElement("div");
    body.className = "detail-body";

    body.appendChild(Renderjson(params));
    div.appendChild(body);
  }
  container.appendChild(div);
  scrollToTop();
};

const request = (message, params) => {
  logObject(message, params, "outgoing");
};

const response = (message, params) => {
  logObject(message, params, "incoming");
};

const setLoading = (loading, loadingMessage) => {
  if (loading) {
    actionButton.textContent = loadingMessage || "Waiting...";
    actionButton.disabled = true;
    actionButton.classList.add("loading");
  } else {
    actionButton.textContent = loadingMessage || "Continue";
    actionButton.disabled = false;
    actionButton.classList.remove("loading");
  }
};

/*
 * Assertions to ensure things are going correctly,
 * and to bail early if not.  Currently just shows
 * an error, but we can make it actually stop the flow.
 */
const expect = (expectation, message) => {
  if (!expectation) {
    error(message);
  }
};

const setDevicePage = (src) => {
  deviceFrame.src = src;
};

const waitForPageContinue = (src) => {
  return new Promise((resolve, reject) => {
    deviceFrame.src = src;
    const cb = function(e) {
      if (e.data.continue) {
        window.removeEventListener("message", cb);
        resolve();
      }
    };
    window.addEventListener("message", cb);
  });
};

const error = (message) => {
  addEntry(message, "error");
};

const onNext = (cb) => actionButton.addEventListener("click", cb);

module.exports = {
  expect,
  instruction,
  action,
  response,
  request,
  error,
  logObject,

  onNext,
  setLoading,

  showConfig,
  setDevicePage,
  waitForPageContinue,
};
