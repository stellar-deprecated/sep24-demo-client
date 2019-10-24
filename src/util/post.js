const Config = require("../config");

module.exports = async function(path, params = {}, options = {}) {
  const url = new URL(path, window.location);
  const formData = new FormData();
  Object.keys(params).forEach((key) => formData.append(key, params[key]));
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formData,
    ...options,
  };
  const result = await fetch(url, options);
  if (result.headers.get("content-type").indexOf("json") != 0) {
    return result.json();
  }
  // Error case
  const body = await result.text();
  throw "Unexpected error from server: " + body;
};
