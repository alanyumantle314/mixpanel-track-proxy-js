const express = require("express");
const bodyParser = require("body-parser");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const axios = require("axios");

// declare a new express app
const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Middleware: log request
app.use(function(req, res, next) {
  console.log("Request Log:", req);
  next();
});

// /lib.js
app.get("/lib.js", async function(req, res) {
  let response = await axios.get(
    "https://cdn.mxpnl.com/libs/mixpanel-2-latest.js"
  );

  res
    .header(response.headers)
    .status(response.status)
    .send(response.data);
});

// /lib.min.js
app.get("/lib.min.js", async function(req, res) {
  const response = await axios.get(
    "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"
  );

  res
    .header(response.headers)
    .status(response.status)
    .send(response.data);
});

app.get("/*", requestHandler);
app.post("/*", requestHandler);

// // decide
// app.get("/decide", requestHandler);
// app.post("/decide", requestHandler);

// // engage
// app.get("/engage", requestHandler);
// app.post("/engage", requestHandler);

// // track
// app.get("/track", requestHandler);
// app.post("/track", requestHandler);

app.listen(3000, function() {
  console.log("App started");
});

// Methods
async function requestHandler(req, res) {
  const path = req.path;

  // /decide is hosted on a different subdomain
  let mixpanelHost = path.startsWith("/decide")
    ? "decide.mixpanel.com"
    : "api.mixpanel.com";

  // client Ip
  let ipStr =
    req.headers["http-x-forwarded-for"] ??
    req.headers["http-x-real-ip"] ??
    req.headers["x-forwarded-for"] ?? '';

  let ips = ipStr.split(',');
  let ip = ips && ips.length > 0 ? ips[0] : '';

  // headers
  let headers = { ...req.headers };
  headers["X-Real-IP"] = ip;
  headers["host"] = mixpanelHost;

  // api call
  console.log("req.body:", req.body);
  let options = {
    baseURL: `https://${mixpanelHost}`,
    url: req.url,
    method: req.method,
    headers: headers,
    data: req.body,
  };
  console.log("axios-options:", options);
  let response = await axios(options);
  console.log("axios-response:", response);

  res
    .header(response.headers)
    .status(response.status)
    .send(response.data);
}

module.exports = app;
