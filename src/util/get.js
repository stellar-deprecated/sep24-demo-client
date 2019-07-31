module.exports = function (path, params, options = {}) {
  const url = new URL(path, window.location);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
  return fetch(url, options).then(r => r.json())
}