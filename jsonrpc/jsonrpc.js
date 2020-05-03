const rpc = require("json-rpc2");
const fs = require("fs");
const sub = require("../lib/sub");
const util = require("../lib/util");
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
    console.log(`subProductPublish:${args[0]}`);
    const { sender_pub_key, sender_sign, user_data, user_pub_key, user_sign } = param;
    const { knowledge_id, model_id, product_id, content_hash, extra_compute_ratio, memo } = user_data;

    // validate sender
    if (!verifyPubKey(sender_pub_key)) {
      sendResult(callback, { error: "not valid address" });
      return;
    }

    // verify sender sign
    const senderVerify = sub.verify(sender_pub_key, user_pub_key + user_sign, sender_sign);
    if (!senderVerify.isValid) {
      sendResult(callback, { error: "sender sign verify fail" });
      return;
    }

    // verify user sign
    const userVerify = sub.verify(user_pub_key, util.getObjectFieldValueStr(user_data), user_sign);
    if (!userVerify.isValid) {
      sendResult(callback, { error: "user sign verify fail" });
      return;
    }

    // TODO: invoke chain interface
    sendResult(callback, { result: "pending" });
  } catch (e) {
    console.error(`subProductPublish error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

// support functions

// verify sender pubkey
const verifyPubKey = (address) => (server_white_list[address] ? true : false);

const sendResult = (callback, data) => {
  callback(null, JSON.stringify(data));
};

const loadKeys = () => {
  Object.keys(server_white_list).forEach((address) => {
    try {
      const keyData = fs.readFileSync(`jsonrpc/keys/${address}.json`);
      const json = JSON.parse(keyData);

      sub.setupAccountByJson(json.json);
    } catch (e) {
      console.error(e);
    }
  });
};

// TODO: init api connection
console.log("init keyring...");
sub.initKeyring().then(() => {
  console.log("init keyring done!");
  loadKeys();
  const port = config.get("port");
  server.listen(port, "localhost");
  console.log(`server start on ${port}`);
});
