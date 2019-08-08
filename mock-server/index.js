const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");

var server = restify.createServer();
const cors = corsMiddleware({
  origins: ["*"]
});
server.pre(cors.preflight);
server.use(cors.actual);

server.get("/info", (req, res) => {
  console.log("Get info");
  res.send(require("./resp/info"));
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
