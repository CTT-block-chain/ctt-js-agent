const rpc = require("json-rpc2");
const fs = require("fs");
const sub = require("../lib/sub");
const util = require("../lib/util");
const config = require("../config/config");

const document = require("../interface/document");
const comment = require("../interface/comment");
const model = require("../interface/model");

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
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      para_issue_rate: 参数发布率 String
 *      self_issue_rate: 自证参数发布率 String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_data: {  应用数据
 *      document_id: 文章ID  String
 *      model_id: 商品模型ID String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *    }
 *    app_sign: 用户数据签名 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("subProductPublish", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductPublish:${args[0]}`);
    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { document_id, model_id, product_id, content_hash } = param.app_data;
    let { app_id, para_issue_rate, self_issue_rate } = param.sender_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    // TODO: data fields validation check
    para_issue_rate = Math.round(Number(para_issue_rate) * 100);
    self_issue_rate = Math.round(Number(self_issue_rate) * 100);

    let doc = document.create(
      app_id,
      document_id,
      0,
      model_id,
      product_id,
      content_hash,
      para_issue_rate,
      self_issue_rate,
      0,
      0,
      0,
      0,
      0,
      0
    );
    sub
      .createDocument(doc, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log("createDocument result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subProductPublish error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * product indentify
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      goods_price: 商品价格 String
 *      ident_rate: 参数鉴别率 String
 *      ident_consistence: 鉴别核实一致性  String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_data: {  应用数据
 *      document_id: 文章ID  String
 *      model_id: 商品模型ID String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *      cart_id: 购物车id String
 *    }
 *    app_sign: 用户数据签名 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("subProductIdentify", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductIdentify:${args[0]}`);
    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { document_id, model_id, product_id, content_hash, cart_id } = param.app_data;
    let { app_id, goods_price, ident_rate, ident_consistence } = param.sender_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    // conver $ to cent
    goods_price = Math.round(Number(goods_price) * 100);
    ident_rate = Math.round(Number(ident_rate) * 100);
    ident_consistence = Math.round(Number(ident_consistence) * 100);

    let doc = document.create(
      app_id,
      document_id,
      1,
      model_id,
      product_id,
      content_hash,
      0,
      0,
      goods_price,
      ident_rate,
      ident_consistence,
      cart_id
    );
    sub
      .createDocument(doc, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log("createDocument result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subProductIdentify error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * product try
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      goods_price: 商品价格 String
 *      offset_rate: 品鉴偏差率 String
 *      true_rate: 品鉴真实度 String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_data: {  应用数据
 *      document_id: 文章ID  String
 *      model_id: 商品模型ID String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *      cart_id: 购物车id String
 *    }
 *    app_sign: 用户数据签名 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("subProductTry", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductIdentify:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { document_id, model_id, product_id, content_hash, cart_id } = param.app_data;
    let { app_id, goods_price, offset_rate, true_rate } = param.sender_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    goods_price = Math.round(Number(goods_price) * 100);
    offset_rate = Math.round(Number(offset_rate) * 100);
    true_rate = Math.round(Number(true_rate) * 100);

    let doc = document.create(
      app_id,
      document_id,
      1,
      model_id,
      product_id,
      content_hash,
      0,
      0,
      goods_price,
      0,
      0,
      cart_id,
      offset_rate,
      true_rate
    );
    sub
      .createDocument(doc, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log("createDocument result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subProductTry error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 *  product model operation
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      model_id: 商品模型ID String
 *      expert_id: 专家ID String
 *      interface_status: 接口状态 String("0": 废止, "1": 创建)
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_data: {  应用数据
 *      commodity_name: 商品名称 String
 *      commodity_type: 商品类型 String
 *      content_hash: String
 *    }
 *    app_sign: 用户数据签名 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("subModelOperate", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subModelOperate:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { commodity_name, commodity_type, content_hash } = param.app_data;
    const { app_id, model_id, expert_id, interface_status } = param.sender_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    let api;
    let mod = model.create(app_id, model_id, expert_id, commodity_name, commodity_type, content_hash);

    if (interface_status === "1") {
      api = sub.createModel;
    } else {
      api = sub.disableModel;
    }

    api(mod, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log("modelOperate result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subModelOperate error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 *  product model operation
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      last_block_num: 上次区块高度 String
 *      statistics_period: 统计周期 String
 *      statistics_type: 统计类型 String
 *      model_id: 商品模型ID String
 *      commodity_name: 商品名称 String
 *      sale_total: 销售总收入 String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("subSaleStat", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subSaleStat:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: "sign veify fail" });
      return;
    }

    // TODO: invoke chain interface
    sendResult(callback, { result: "pending" });
  } catch (e) {
    console.error(`subSaleStat error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

// server vote related interfaces

/**
 * knowledge power parameters change vote
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      vote_start_time: 投票开始时间 String (格式: 1970-01-01T00:00:00)
 *      vote_end_time: 投票结束时间 String (格式: 1970-01-01T00:00:00)
 *      decayperiod: 衰减周期 String (天数，例如 5)
 *      decaypercentag: 衰减百分比 String (例如："0.02")
 *      finaldecay: 最终衰减值 String
 *      parameter_publish 参数发布权重 String
 *      identification 鉴别文章权重 String
 *      appraisal 品鉴文章权重 String
 *      consumers_comment 消费者点评权重 String
 *      profit 权益 String
 *      kpt_bond 抵押 String
 *      goods_price
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("subKpParamsChangeVote", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subKpParamsChangeVote:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: "sign veify fail" });
      return;
    }

    // TODO: invoke chain interface
    sendResult(callback, { result: "pending" });
  } catch (e) {
    console.error(`subKpParamsChangeVote error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * SUDO 设置APP ROOT账户
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      app_root_pub_key: APP ROOT公钥 String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
/*server.expose("membersSetAppAdmin", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersSetAppAdmin:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { app_id, app_root_pub_key } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: "sign veify fail" });
      return;
    }

    sub
      .membersSetAppAdmin(app_id, app_root_pub_key, sender_pub_key)
      .then((result) => {
        console.log("membersSetAppAdmin result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersSetAppAdmin error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});*/

/**
 * 增加APP平台点评组成员
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      op_type: "0": 增加, "1": 删除 String
 *      new_member_pub_key: 新增成员公钥 String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("membersOperatePlatformExpert", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersOperatePlatformExpert:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { app_id, op_type, new_member_pub_key } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: "sign veify fail" });
      return;
    }

    sub
      .membersOperatePlatformExpert(app_id, op_type, new_member_pub_key, sender_pub_key)
      .then((result) => {
        console.log("membersOperatePlatformExpert result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersOperatePlatformExpert error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 删除模型专家组成员
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_data: {  应用数据
 *      app_id: 应用ID String
 *      model_id: 商品模型ID String
 *      old_member_pub_key: 待删除成员公钥 String
 *    }
 *    app_sign: 用户数据签名 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose("membersRemoveExpertByCreator", (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersRemoveExpertByCreator:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign, app_pub_key, app_sign } = param;
    const { app_id, model_id, old_member_pub_key } = param.app_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    sub
      .membersRemoveExpertByCreator(
        app_id,
        model_id,
        old_member_pub_key,
        app_pub_key,
        app_sign,
        sender_pub_key,
        sender_sign
      )
      .then((result) => {
        console.log("membersRemoveExpertByCreator result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersRemoveExpertByCreator error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

// power related query
/**
 * 查询全网算力
 * 无参数
 */
server.expose("queryTotalPower", (args, opt, callback) => {
  try {
    sub
      .rpcGetTotalPower()
      .then((result) => {
        console.log("queryTotalPower result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryTotalPower error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询账户算力
 * {
 *    sender_data: { 发送端数据
 *      address: 账户地址 String
 *    }
 * }
 */
server.expose("queryAccountPower", (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`queryAccountPower:${args[0]}`);
  const { address } = param.sender_data;

  try {
    sub
      .rpcGetAccountPower(address)
      .then((result) => {
        console.log("queryTotalPower result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryTotalPower error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询体验商品算力
 * {
 *    sender_data: { 发送端数据
 *      app_id:  String
 *      cart_id: String
 *    }
 * }
 */
server.expose("queryCommodityPower", (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`queryCommodityPower:${args[0]}`);
  const { app_id, cart_id } = param.sender_data;

  try {
    sub
      .rpcGetCommodityPower(app_id, cart_id)
      .then((result) => {
        console.log("queryCommodityPower result:", result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryCommodityPower error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

// support functions
// verify server api sign
const verifyServerSign = (param) => {
  const { sender_pub_key, sender_data, sender_sign, app_data, app_pub_key, app_sign } = param;
  const result = {
    isOk: false,
    msg: "unknown",
  };

  // validate sender
  if (!verifyPubKey(sender_pub_key)) {
    //sendResult(callback, { error: "not valid address" });
    result.msg = "not valid address";
    return result;
  }

  // verify sender sign
  const senderVerify = sub.verify(
    sender_pub_key,
    util.getObjectFieldValueStr(sender_data) + app_pub_key + app_sign,
    sender_sign
  );
  if (!senderVerify.isValid) {
    // sendResult(callback, { error: "sender sign verify fail" });
    result.msg = "sender sign verify fail";
    return result;
  }

  // verify app sign
  const appVerify = sub.verify(app_pub_key, util.getObjectFieldValueStr(app_data), app_sign);
  if (!appVerify.isValid) {
    // sendResult(callback, { error: "app sign verify fail" });
    result.msg = "app sign verify fail";
    return result;
  }

  result.isOk = true;
  return result;
};

// verify sender pubkey
const verifyPubKey = (address) => (server_white_list[address] ? true : false);

const sendResult = (callback, data) => {
  callback(null, JSON.stringify(data));
};

// disable loadKeys
const loadKeys = () => {
  /*Object.keys(server_white_list).forEach((address) => {
    try {
      const keyData = fs.readFileSync(`jsonrpc/keys/${address}.json`);
      const json = JSON.parse(keyData);

      sub.setupAccountByJson(json.json);
    } catch (e) {
      console.error(e);
    }
  });*/
};

// TODO: init api connection
console.log("init keyring...");
sub.initKeyring().then(() => {
  console.log("init keyring done!");
  loadKeys();
  const port = config.get("port");
  server.listen(port);
  console.log(`server start on ${port}`);
});

const apiAddr = config.get("sub_endpoint");
console.log("trying to connect to:", apiAddr);

function sub_notify_cb(method, data) {
  console.log("SUB notify:", method, data);
}

sub.initApi(apiAddr, sub_notify_cb).then(() => {
  console.log("init api done!");

  // test
  // sub.rpcGetAccountPower("5GrwX4JEmrmk2RM6aTorJxzbpDWzgoifKVtHCPdjQohjRPo6").then((res) => console.log("p:", res));
  // sub.rpcGetCommodityPower("0x01", "0x01").then((res) => console.log("p:", res));

  // check dev balances
  sub.balancesAll(sub.getDevAdmin().address).then((info) => {
    console.log("dev(alice) balance:", info);
  });

  sub.balancesAll("5EUQBQByNtomUNJCCCN9zTuXNLC9JL5PpceT9K1AtDWceYxg").then((info) => {
    console.log("5EUQBQByNtomUNJCCCN9zTuXNLC9JL5PpceT9K1AtDWceYxg balance:", info.transferable.toString());
  });

  //sub.devTransfer("5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk", 1000000000000000);

  //sub.devTransfer("5EUQBQByNtomUNJCCCN9zTuXNLC9JL5PpceT9K1AtDWceYxg", 1000000000000000);
  //sub.devTransfer("5FyCrqVh4NYzNdRXehbS7jFBT95TkQ1DQud9rbeDhL7SUSXd", 1000000000000000);
  //sub.devTransfer("5FNg8a6QrgtSg5QjNA4x9B2JMzquC8F1Uq7rC7GV77mcxF3K", 1000000000000000);
  //sub.devTransfer("5Gdw5xA3rWG61Gp7uP4bq4GoHygTZnTnyKLtdm5cPPwTYv5c", 1000000000000000);
  //sub.devTransfer("5EbavMXi76q8bfnaY2n7fXYr8Aqvoqo2h9r8SdyB6MjVWa3S", 1000000000000000);
  //sub.devTransfer("5H8i6WyFAE38fofPw2fYmhYdPxE8abwsZY582TNv5MbDbZcb", 1000000000000000);
  //sub.devTransfer("5EbavMXi76q8bfnaY2n7fXYr8Aqvoqo2h9r8SdyB6MjVWa3S", 1000000000000000);
  //sub.devTransfer("5Gdw5xA3rWG61Gp7uP4bq4GoHygTZnTnyKLtdm5cPPwTYv5c", 1000000000000000);
  //sub.devTransfer("5GW69fQSx1EnnrsgMN1Khnbmg9JzhrBmPcrTQknJcHthrr8V", 1000000000000000);

  /*sub
    .membersSetAppAdmin("12345678", "5Gdw5xA3rWG61Gp7uP4bq4GoHygTZnTnyKLtdm5cPPwTYv5c", sub.getDevAdmin().address)
    .then((info) => {
      console.log("set app admin result:", info);
    })
    .catch((e) => {
      console.error("set app admin error:", e);
    });*/

  /*let before;
  sub.balancesAll("5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk").then((info) => {
    console.log(
      "5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk balance before transfer:",
      info.transferable.toString()
    );
    before = info.transferable;
  });

  console.log("start:", new Date());
  sub.devTransfer("5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk", "32.7897456").then((result) => {
    console.log(result);
    console.log("end:", new Date());

    sub.balancesAll("5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk").then((info) => {
      console.log(
        "5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk balance after transfer:",
        info.transferable.toString()
      );
      console.log("transfer diff:", before.sub(info.transferable).toString());
    });
  });*/
});
