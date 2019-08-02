const Config = require("../config");

module.exports = async function(path, params, options = {}) {
  const BASE = Config.get("BRIDGE_URL");
  const url = new URL(BASE + path, window.location);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const result = await fetch(url, options);
  if (result.headers.get("content-type") == "application/json") {
    return result.json();
  }
  // Error case
  const body = await result.text();
  throw "Unexpected error from server: " + body;
};
