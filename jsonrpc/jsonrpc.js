const rpc = require("json-rpc2");
const sub = require("../lib/sub");
const config = require("../config/config");

const server_white_list = require("./keys/wl.json");

const server = rpc.Server.$create({
  websocket: false, // is true by default
  headers: {
    // allow custom headers is empty by default
    "Access-Control-Allow-Origin": "*",
  },
});

/**
 * create account
 * param :  {"name": "bob", "pwd": "123456"}
 * return: {"result": {"json": json struct, "mnemonic": mnemonic}} or error
 */
server.expose("subNewAccount", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    const result = sub.newAccount(param.name, param.pwd);
    sendResult(callback, { result });
  } catch (e) {
    console.error(`subNewAccount error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * load account by json
 * param : account JSON
 * return: {"reuslt": "ok"} or error
 */
server.expose("subSetupAccountByJson", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    sub.setupAccountByJson(param);
    sendResult(callback, { result: "ok" });
  } catch (e) {
    console.error(`subSetupAccountByJson error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * unlock account
 * param : {"address" : "xxx", "pwd": "xxx"}
 * return: {"result": "ok"} or error
 */
server.expose("subUnlock", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    sub.unlock(param.address, param.pwd);
    sendResult(callback, { result: "ok" });
  } catch (e) {
    console.error(`subUnlock error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * lock account
 * param : {"address" : "xxx"}
 * return: {"result": "ok"} or error
 */
server.expose("subLock", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    sub.lock(param.address);
    sendResult(callback, { result: "ok" });
  } catch (e) {
    console.error(`subLock error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * sign string
 * param : {"address" : "xxx", "msg": "xxx"}
 * return: {"result": "xxx"} or error
 */
server.expose("subSign", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    const result = sub.sign(param.address, param.msg);
    sendResult(callback, { result });
  } catch (e) {
    console.error(`subSign error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * verify sign
 * param : {"address" : "xxx", "msg": "xxx", "sign": "xxx"}
 * return: {"result": "1" or "0"} or error
 */
server.expose("subVerify", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    const result = sub.verify(param.address, param.msg, param.sign);
    sendResult(callback, { result: result.isValid ? 1 : 0 });
  } catch (e) {
    console.error(`subVerify error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * hash incoming string
 * param : {"data": "xxxxx"}
 * return: hash hex string
 */
server.expose("subHash", (args, opt, callback) => {
  try {
    let result = "";
    const param = JSON.parse(args[0]);
    if (!param.data) {
      console.log(`hash invalid params: ${param}`);
    } else {
      result = sub.hash(param.data);
    }
    console.log(`hash result: ${result}`);
    sendResult(callback, { result });
  } catch (e) {
    console.error(`hash error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

// below apis need sub node connection ready

/**
 * product parameters publish
 */
server.expose("subProductPublish", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    const address = param.user_pub_key;

    if (!verifyPubKey(address)) {
      sendResult(callback, { error: "not valid pub key" });
      return;
    }

    // TODO: other parameters
  } catch (e) {
    console.error(`subProductPublish error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

// support functions

// init pub key white list

// verify sender pubkey
const verifyPubKey = (address) => (server_white_list[address] ? true : false);

const sendResult = (callback, data) => {
  callback(null, JSON.stringify(data));
};

// TODO: init api connection
console.log("init keyring...");
sub.initKeyring().then(() => {
  console.log("init keyring done!");
  const port = config.get("port");
  server.listen(port, "localhost");
  console.log(`server start on ${port}`);
});
