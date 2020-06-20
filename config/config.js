const convict = require("convict");

// Define a schema
var config = convict({
  env: {
    doc: "The application environment.",
    format: ["prod", "dev", "test"],
    default: "dev",
    env: "NODE_ENV",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 5080,
    env: "PORT",
    arg: "port",
  },
  sub_endpoint: {
    doc: "Sub node web socket api endpoint",
    format: String,
    default: "ws://39.106.116.92:9944",
    env: "SUB_ENDPOINT",
    arg: "sub_endpoint",
  },
});

// Load environment dependent configuration
var env = config.get("env");
config.loadFile("./config/" + env + ".json");

// Perform validation
config.validate({ allowed: "strict" });

module.exports = config;
