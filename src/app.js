const awsServerlessExpress = require("aws-serverless-express");
const app = require("./api.js");

// Express server
const server = awsServerlessExpress.createServer(app);

exports.lambdaHandler = (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  return awsServerlessExpress.proxy(server, event, context, "PROMISE").promise;
};
