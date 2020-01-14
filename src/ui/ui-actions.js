const Config = require("../config");

const Renderjson = require("renderjson");
Renderjson.set_show_to_level(1);

const $ = (id) => document.getElementById(id);

const section = $("instructions-section");
const container = $("instructions-container");
const actionButton = $("action-button");
const configButton = $("config-button");
const configPanel = $("config-panel");
const deviceFrame = $("device-frame");
const downloadLogsButton = $("download-logs-button");

var logsList = [];

configButton.addEventListener("click", () => {
  configPanel.classList.toggle("visible");
});

function downloadFile(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

downloadLogsButton.addEventListener("click", () => {
  logsOutputText = ``;
  errorsList = [];
  logsList.forEach(function(entry) {
    if (entry.className == "error") {
      errorsList.push(entry.message);
    }
    if (entry.params) {
      logsOutputText += `**${entry.className}:** ${
        entry.message
      }\n ${JSON.stringify(entry.params, null, 4)} \n\n`;
    } else {
      logsOutputText += `**${entry.className}:** ${entry.message}\n\n`;
    }
  });

  fileHeader = `# ${new Date()}\n`;
  if (errorsList.length == 0) {
    fileHeader += `# No errors were logged`;  
  } else {
    fileHeader += `# Number of Errors: ${errorsList.length}\n`;
    errorsList.forEach(function(entry) {
      fileHeader += `    ${entry}\n`
    });
  }
  fileHeader += "\n----------------------\n\n";
  
  fileName = `demo-client-logs- + ${Date.now()}.md`;
  downloadFile(fileName, fileHeader + logsOutputText);
});

const showConfig = () => {
  configPanel.classList.add("visible");
};

const scrollToTop = () => (section.scrollTop = section.scrollHeight);

const addEntry = (message, className) => {
  logsList.push({ message: message, className: className });

  const div = document.createElement("div");
  div.textContent = message;
  div.className = className + " log-entry";
  container.appendChild(div);
  scrollToTop();
};
const action = (message) => addEntry(message, "action");
const instruction = (instruction) => addEntry(instruction, "instruction");

const logObject = (message, params, className = "informational") => {
  logsList.push({ message: message, params: params, className: className });

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

let isFailed = false;
const setFailed = () => {
  actionButton.disabled = true;
  actionButton.textContent = "Failed";
  actionButton.classList.remove("loading");
  actionButton.classList.add("failed");
  isFailed = true;
};

const setLoading = (loading, loadingMessage) => {
  if (isFailed) return;
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

const finish = () => {
  actionButton.textContent = "Finished!";
  actionButton.disabled = true;
  actionButton.classList.remove("loading");
  actionButton.classList.add("finished");
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

const panel = $("close-panel");
const cb = () => {
  window.postMessage({
    message: "close-button",
  });
  panel.style.display = "none";
};
panel.addEventListener("click", cb);
const showClosePanel = () => {
  panel.style.display = null;
};

const setDevicePage = (src) => {
  deviceFrame.src = src;
};

const waitForPageMessage = (src) => {
  return new Promise((resolve, reject) => {
    deviceFrame.src = src;
    const cb = function(e) {
      if (e.data.message) {
        window.removeEventListener("message", cb);
        resolve(e.data.message);
      }
    };
    window.addEventListener("message", cb);
  });
};

const error = (message) => {
  addEntry(message, "error");
  if (Config.get("STRICT_MODE")) setFailed();
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
  setFailed,
  finish,

  showConfig,
  setDevicePage,
  waitForPageMessage,
  showClosePanel,
};
