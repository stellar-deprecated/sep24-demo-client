let StellarSDK = require("stellar-sdk");

let fields = [
  {
    key: "HOME_DOMAIN",
    label: "Domain hosting the stellar.toml file",
    value: null,
    optional: true,
  },
  {
    key: "TRANSFER_SERVER",
    label: "(OPTIONAL) Override the transfer server url",
    value: null,
    optional: true,
  },
  {
    key: "WEB_AUTH_ENDPOINT",
    label: "(OPTIONAL) Override the web auth SEP10 url",
    value: null,
    optional: true,
  },

  {
    key: "USER_SK",
    label: "Stellar wallet secret key",
    value: null,
    button: {
      text: "Fund",
      action: async (opt, input) => {
        opt.buttonElement.textContent = "Funding";
        const pair = StellarSDK.Keypair.fromSecret(input.value);
        console.log(pair);
        try {
          const response = await fetch(
            `https://friendbot.stellar.org?addr=${encodeURIComponent(
              pair.publicKey(),
            )}`,
          );
          if (response.status == 200) {
            opt.buttonElement.textContent = "Success!";
          } else {
            opt.buttonElement.textContent = "Couldn't create this account";
          }
        } catch (e) {
          console.error("ERROR!", e);
          opt.buttonElement.textContent = "Couldn't create this account";
        }
      },
    },
  },
  { key: "HORIZON_URL", label: "URL of the Horizon server", value: null },
  { key: "ASSET_CODE", label: "Asset code to withdraw", value: null },
  {
    key: "ASSET_ISSUER",
    label: "(OPTIONAL) Override the public key of asset issuer",
    value: null,
    optional: true,
  },
  {
    key: "EMAIL_ADDRESS",
    label: "(OPTIONAL) Email address to pass into interactive url",
    value: null,
    optional: true,
  },
  {
    key: "AUTO_ADVANCE",
    label: "Automatically perform background operations",
    value: false,
    type: "checkbox",
  },
  {
    key: "PUBNET",
    label: "Operate on Pubnet instead of Testnet (NOT RECOMMENDED)",
    value: false,
    type: "checkbox",
  },
];

const save = () => {
  fields.forEach((field) => {
    if (field.type === "checkbox") {
      field.value = field.element.checked;
    } else {
      field.value = field.element.value;
    }
    localStorage.setItem(field.key, JSON.stringify(field.value));
  });
  window.location.hash = fields
    .map((field) => `${field.key}=${encodeURI(JSON.stringify(field.value))}`)
    .join("&");
  callbacks.forEach((f) => f());
};

const load = () => {
  const hashFields = window.location.hash
    .substring(1)
    .split("&")
    .map((entry) => entry.split("="))
    .reduce((obj, val) => {
      obj[val[0]] = val[1];
      return obj;
    }, {});

  fields.forEach((field) => {
    let hashValue = hashFields[field.key];
    if (hashValue) hashValue = JSON.parse(decodeURI(hashValue));
    // Prefer query param but fall back to local storage
    field.value =
      hashValue !== undefined
        ? hashValue
        : JSON.parse(localStorage.getItem(field.key));
    field.element.value = field.value;
    field.element.checked = field.value;
  });
  save(); // In case we used the query params we should persist it
};

const callbacks = [];
/*
 * Add a listener to be called back whenever the config changes.
 */
const listen = (callback) => {
  callbacks.push(callback);
};

const createClose = (panel) => () => panel.classList.remove("visible");

const installUI = (panel) => {
  const close = createClose(panel);
  panel.querySelector("#close-button").addEventListener("click", close);
  const form = panel.querySelector("form");

  fields.forEach((field) => {
    const container = document.createElement("div");
    container.className = "form-group form-group--" + (field.type || "text");
    const label = document.createElement("label");
    label.setAttribute("for", `config-field-${field.key}`);
    label.textContent = field.label;

    const input = document.createElement("input");
    input.id = `config-field-${field.key}`;
    input.type = field.type || "text";
    input.placeholder = field.key;
    field.element = input;

    if (field.button) {
      const button = document.createElement("button");
      button.textContent = field.button.text;
      button.addEventListener(
        "click",
        function() {
          console.log("Click", this);
          this.button.action(this, input);
        }.bind(field, input),
      );
      container.appendChild(button);
      field.buttonElement = button;
    }

    container.appendChild(label);
    container.appendChild(input);
    form.appendChild(container);
  });
  load();
  document.getElementById("cancel-config").addEventListener("click", () => {
    close();
  });
  document.getElementById("apply-config").addEventListener("click", () => {
    save();
    close();
  });
};

const get = (key) => {
  const field = fields.find((f) => f.key === key);
  if (!field) {
    throw "Unknown configuration key " + key;
  }
  if (!field.optional && !(field.value || field.type == "checkbox")) {
    throw "Missing required config for " + key;
  }
  if (field.type == "checkbox") return field.value;
  return field.value;
};

const isValid = () => {
  return fields.every((f) => !!f.value || f.type === "checkbox" || f.optional);
};

module.exports = {
  installUI,
  get,
  isValid,
  fields,
  listen,
};
