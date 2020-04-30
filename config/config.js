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
});

// Load environment dependent configuration
var env = config.get("env");
config.loadFile("./config/" + env + ".json");

// Perform validation
config.validate({ allowed: "strict" });

module.exports = config;
