let fields = [
  { key: "BRIDGE_URL", label: "URL to the TRANSFER_SERVER", value: null },
  { key: "USER_PK", label: "Stellar wallet public key / account", value: null },
  { key: "USER_SK", label: "Stellar wallet secret key", value: null },
  { key: "HORIZON_URI", label: "URL of the horizon server", value: null },
  { key: "ASSET_CODE", label: "Asset code to withdraw", value: null }
];

const save = () => {
  fields.forEach(field => {
    localStorage.setItem(field.key, JSON.stringify(field.value));
  });
};

const load = () => {
  fields.forEach(field => {
    field.value = JSON.parse(localStorage.getItem(field.key));
  });
};

const fieldChangeListener = field => {
  return e => {
    field.value = e.target.value;
    save();
  };
};

const installUI = el => {
  load();
  fields.forEach(field => {
    const container = document.createElement("div");
    container.className = "config-group";
    const label = document.createElement("label");
    label.for = `config-field-${field.key}`;
    label.textContent = field.label;

    const input = document.createElement("input");
    input.id = `config-field-${field.key}`;
    input.type = "text";
    input.placeholder = field.key;
    input.value = field.value;

    container.appendChild(label);
    container.appendChild(input);
    el.appendChild(container);

    input.addEventListener("change", fieldChangeListener(field));
    input.addEventListener("keyup", fieldChangeListener(field));
  });
};

const get = key => {
  const field = fields.find(f => f.key === key);
  if (!field || !field.value) {
    throw "Missing required config for " + key;
  }
  return field.value;
};

const isValid = () => {
  return fields.every(f => !!f.value);
};

module.exports = {
  installUI,
  get,
  isValid,
  fields
};
