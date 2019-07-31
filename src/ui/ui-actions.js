const Renderjson = require("renderjson");
Renderjson.set_show_to_level(1);

const container = document.getElementById("container");
const actionText = document.getElementById("action-text");
const actionButton = document.getElementById("action-button");
const configButton = document.getElementById("config-button");
const configPanel = document.getElementById("config-panel");

configButton.addEventListener("click", () => {
  configPanel.classList.toggle("visible");
});

const showConfig = () => {
  configPanel.classList.add("visible");
};

const addEntry = (message, className) => {
  const div = document.createElement("div");
  div.textContent = message;
  div.className = className;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
};

const setAction = action => {
  actionText.textContent = action || "Continue";
};

const addInstruction = instruction => addEntry(instruction, "instruction");
const addLog = message => {
  if (typeof message === "object") {
    container.appendChild(Renderjson(message));
    return;
  }
  addEntry(message, "log");
};

const setLoading = (loading, loadingMessage) => {
  if (loading) {
    actionButton.textContent = loadingMessage || "Loading...";
    actionButton.disabled = true;
  } else {
    actionButton.textContent = "Continue";
    actionButton.disabled = false;
  }
};

const error = message => {
  console.error(error);
  addEntry(message, "error");
};
module.exports = {
  addEntry,
  setAction,
  instruction: addInstruction,
  log: addLog,
  actionButton,
  container,
  actionText,
  setLoading,
  error,
  showConfig
};
