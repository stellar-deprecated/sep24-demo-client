let fields = [
  { key: "BRIDGE_URL", label: "URL to the TRANSFER_SERVER", value: null },
  {
    key: "AUTH_SERVER_URL",
    label: "URL to the WEB_AUTH_ENDPOINT",
    value: null
  },
  { key: "USER_SK", label: "Stellar wallet secret key", value: null },
  { key: "HORIZON_URI", label: "URL of the horizon server", value: null },
  { key: "ASSET_CODE", label: "Asset code to withdraw", value: null },
  {
    key: "AUTO_ADVANCE",
    label: "Automatically perform background operations",
    value: false,
    type: "checkbox"
  },
  {
    key: "MAINNET",
    label: "Operate on Mainnet instead of Testnet (NOT RECOMMENDED)",
    value: false,
    type: "checkbox"
  }
];

const save = () => {
  fields.forEach(field => {
    localStorage.setItem(field.key, JSON.stringify(field.value));
  });
};

const load = () => {
  const hashFields = window.location.hash
    .substring(1)
    .split("&")
    .map(entry => entry.split("="))
    .reduce((obj, val) => {
      obj[val[0]] = val[1];
      return obj;
    }, {});

  fields.forEach(field => {
    let hashValue = hashFields[field.key];
    if (hashValue) hashValue = JSON.parse(decodeURI(hashValue));
    // Prefer query param but fall back to local storage
    field.value =
      hashValue !== undefined
        ? hashValue
        : JSON.parse(localStorage.getItem(field.key));
  });
  save(); // In case we used the query params we should persist it
};

const callbacks = [];
/*
 * Add a listener to be called back whenever the config changes.
 */
const listen = callback => {
  callbacks.push(callback);
};

const update = () => {
  window.location.hash = fields
    .map(field => `${field.key}=${encodeURI(JSON.stringify(field.value))}`)
    .join("&");
  callbacks.forEach(f => f());
};

const fieldChangeListener = field => {
  return e => {
    if (field.type === "checkbox") {
      field.value = e.target.checked;
    } else {
      field.value = e.target.value;
    }
    save();
    update();
  };
};

const installUI = el => {
  load();

  fields.forEach(field => {
    const container = document.createElement("div");
    container.className = "form-group";
    const label = document.createElement("label");
    label.for = `config-field-${field.key}`;
    label.textContent = field.label;

    const input = document.createElement("input");
    input.id = `config-field-${field.key}`;
    input.type = field.type || "text";
    input.placeholder = field.key;
    input.value = field.value;
    input.checked = field.value;

    container.appendChild(label);
    container.appendChild(input);
    el.appendChild(container);

    input.addEventListener("change", fieldChangeListener(field));
    input.addEventListener("keyup", fieldChangeListener(field));
    input.addEventListener("click", fieldChangeListener(field));
  });
  update();
};

const get = key => {
  const field = fields.find(f => f.key === key);
  if (!field || !(field.value || field.type == "checkbox")) {
    throw "Missing required config for " + key;
  }
  if (field.type == "checkbox") return field.value;
  return field.value;
};

const isValid = () => {
  return fields.every(f => !!f.value || f.type === "checkbox");
};

module.exports = {
  installUI,
  get,
  isValid,
  fields,
  listen
};
