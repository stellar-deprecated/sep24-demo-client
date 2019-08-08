const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");

var server = restify.createServer();
const cors = corsMiddleware({
  origins: ["*"]
});
server.pre(cors.preflight);
server.use(cors.actual);

const respond = path => {
  return (req, res) => {
    res.send(require(path));
  };
};

server.get("/info", respond("./resp/info"));
server.get("/auth", respond("./resp/get-auth"));
server.post("/auth", respond("./resp/post-auth"));

const PORT = process.env.PORT || 8081;
server.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
