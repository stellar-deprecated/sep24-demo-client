const Config = require("../config");

module.exports = function(path, params, options = {}) {
  const BASE = Config.get("BRIDGE_URL");
  const url = new URL(BASE + path, window.location);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  return fetch(url, options).then(r => r.json());
};
