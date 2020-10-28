const rpc = require('json-rpc2');
const fs = require('fs');
const sub = require('../lib/sub');
const util = require('../lib/util');
const config = require('../config/config');

const document = require('../interface/document');
const comment = require('../interface/comment');
const model = require('../interface/model');
const powerComplain = require('../interface/powerComplain');
const appAdd = require('../interface/addApp');

const server_white_list = require('./keys/wl.json');

const server = rpc.Server.$create({
  websocket: false, // is true by default
  headers: {
    // allow custom headers is empty by default
    'Access-Control-Allow-Origin': '*',
  },
});

/**
 * create account
 * param :  {"name": "bob", "pwd": "123456"}
 * return: {"result": {"json": json struct, "mnemonic": mnemonic}} or error
 */
server.expose('subNewAccount', (args, opt, callback) => {
  try {
    console.log('args:', args[0]);
    const param = JSON.parse(args[0]);
    const result = sub.newAccount(param.name, param.pwd);
    sendResult(callback, { result });
  } catch (e) {
    console.error(`subNewAccount error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * reset account by mnemonic
 * param :  {"name": "bob", "pwd": "123456", "mnemonic": mnemonic}
 * return: {"result": {"json": json struct, "mnemonic": mnemonic}} or error
 */
server.expose('subResetAccountWithMnemonic', (args, opt, callback) => {
  try {
    console.log('args:', args[0]);
    const param = JSON.parse(args[0]);
    const result = sub.resetAccountWithMnemonic(param.name, param.mnemonic, param.pwd);
    sendResult(callback, { result });
  } catch (e) {
    console.error(`subResetAccountWithMnemonic error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * judge account active
 * param :  {"address": "xxxx"}
 * return: {"result": 1 or 0} or error
 */
server.expose('subIsAccountActive', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    const result = sub.isAccountActive(param.address);
    sendResult(callback, { result });
  } catch (e) {
    console.error(`subIsAccountActive error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * load account by json
 * param : account JSON
 * return: {"reuslt": "ok"} or error
 */
server.expose('subSetupAccountByJson', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    sub.setupAccountByJson(param);
    sendResult(callback, { result: 'ok' });
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
server.expose('subUnlock', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    sub.unlock(param.address, param.pwd);
    sendResult(callback, { result: 'ok' });
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
server.expose('subLock', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    sub.lock(param.address);
    sendResult(callback, { result: 'ok' });
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
server.expose('subSign', (args, opt, callback) => {
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
server.expose('subVerify', (args, opt, callback) => {
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
server.expose('subHash', (args, opt, callback) => {
  try {
    let result = '';
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
server.expose('subProductPublish', (args, opt, callback) => {
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
        console.log('createDocument result:', result);
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
server.expose('subProductIdentify', (args, opt, callback) => {
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
        console.log('createDocument result:', result);
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
server.expose('subProductTry', (args, opt, callback) => {
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
      2,
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
        console.log('createDocument result:', result);
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
 * product choose
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      sell_count: 销售数量 Number String
 *      try_count: 体验数量 Number String
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
server.expose('subProductChooseDoc', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductIdentify:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { document_id, model_id, product_id, content_hash } = param.app_data;
    let { app_id, sell_count, try_count } = param.sender_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    sell_count = Number(sell_count);
    try_count = Number(try_count);

    let doc = document.create(
      app_id,
      document_id,
      3,
      model_id,
      product_id,
      content_hash,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      sell_count,
      try_count,
      0,
      0
    );
    sub
      .createDocument(doc, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log('createDocument result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subProductChoose error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * model create document
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      producer_count: 生产数量 Number String
 *      product_count: 产品数量 Number String
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
server.expose('subModelCreateDoc', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subModelCreateDoc:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { document_id, model_id, product_id, content_hash } = param.app_data;
    let { app_id, producer_count, product_count } = param.sender_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    producer_count = Number(producer_count);
    product_count = Number(product_count);

    let doc = document.create(
      app_id,
      document_id,
      4,
      model_id,
      product_id,
      content_hash,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      producer_count,
      product_count
    );
    sub
      .createDocument(doc, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log('createDocument result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subModelCreateDoc error: ${e}`);
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
server.expose('subModelOperate', (args, opt, callback) => {
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
    let mod = model.create(app_id, model_id, expert_id, commodity_name, Number(commodity_type), content_hash);

    if (interface_status === '1') {
      api = sub.createModel;
    } else {
      api = sub.disableModel;
    }

    api(mod, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log('modelOperate result:', result);
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

/** Add new commodity type
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      type_id: Number String, "10001"
 *      type_desc: String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subAddCommodityType', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersSetAppAdmin:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { type_id, type_desc } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    sub
      .addCommodityType(Number(type_id), type_desc)
      .then((result) => {
        console.log('addCommodityType result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`addCommodityType error: ${e}`);
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
server.expose('subSaleStat', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subSaleStat:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    // TODO: invoke chain interface
    sendResult(callback, { result: 'pending' });
  } catch (e) {
    console.error(`subSaleStat error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 触发排行榜创建
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID Number String
 *      model_id: 模型ID String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('createPowerLeader', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`createPowerLeader:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    const { app_id, model_id } = param.sender_data;

    sub
      .createPowerLeaderBoard(app_id, model_id)
      .then((result) => {
        console.log('createPowerLeader result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`createPowerLeader error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询排行榜
 * {
 *    sender_data: { 发送端数据
 *      app_id: 应用ID Number String
 *      model_id: 模型ID String
 *      block: 区块号 （createPowerLeader 获得）
 *    }
 * }
 */
server.expose('queryPowerLeader', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`queryPowerLeader:${args[0]}`);
    const { app_id, model_id, block } = param.sender_data;

    sub
      .rpcLeaderBoardLoad(app_id, model_id, block)
      .then((result) => {
        console.log('queryPowerLeader result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryPowerLeader error: ${e}`);
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
server.expose('subKpParamsChangeVote', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subKpParamsChangeVote:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    // TODO: invoke chain interface
    sendResult(callback, { result: 'pending' });
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
server.expose('membersOperatePlatformExpert', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersOperatePlatformExpert:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { app_id, op_type, new_member_pub_key } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    sub
      .membersOperatePlatformExpert(app_id, op_type, new_member_pub_key, sender_pub_key)
      .then((result) => {
        console.log('membersOperatePlatformExpert result:', result);
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
server.expose('membersRemoveExpertByCreator', (args, opt, callback) => {
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
        console.log('membersRemoveExpertByCreator result:', result);
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

/**
 * 空投新用户KPT
 * {
 *    sender_pub_key: 发送者公钥 String (同时也是资金持有账户)
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      user_id: 用户ID String
 *      receiver_address: 用户账户地址 String
 *      amount: 空投数量 String 例如 "1"
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('membersAirDropNewUserBenefit', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersAirDropNewUserBenefit:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { app_id, user_id, amount, receiver_address } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    sub
      .membersAirDropNewUserBenefit(sender_pub_key, receiver_address, app_id, user_id, amount)
      .then((result) => {
        console.log('membersAirDropNewUserBenefit result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersAirDropNewUserBenefit error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 增加投资角色账户
 * {
 *    sender_pub_key: 发送者公钥 String, app admin 公钥
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *      investor: 投资账户地址 String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('membersAddInvestor', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersAddInvestor:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { app_id, investor } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    sub
      .membersAddInvestor(sender_pub_key, app_id, investor)
      .then((result) => {
        console.log('membersAddInvestor result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersAddInvestor error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * SUDO 增加开发角色账户
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      developer: 开发账户地址 String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('membersAddDeveloper', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersAddDeveloper:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { developer } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    sub
      .membersAddDeveloper(developer)
      .then((result) => {
        console.log('membersAddDeveloper result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersAddDeveloper error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 等额兑换
 * {
 *    sender_pub_key: 发送者公钥 String, app admin 公钥
 *    sender_data: { 发送端数据
 *      app_id: 应用ID Number String
 *      cash_receipt: 现金交易号 String
 *      amount: KPT兑换数量 String
 *      receiver_address: 接收账户 String
 *    }
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('membersStableExchange', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersStableExchange:${args[0]}`);
    const { sender_pub_key, sender_data, sender_sign } = param;
    const { app_id, cash_receipt, amount, receiver_address } = param.sender_data;

    const verify = sub.verify(sender_pub_key, util.getObjectFieldValueStr(sender_data), sender_sign);
    if (!verify.isValid) {
      sendResult(callback, { error: 'sign veify fail' });
      return;
    }

    sub
      .membersStableExchange(app_id, cash_receipt, receiver_address, amount, sender_pub_key)
      .then((result) => {
        console.log('membersStableExchange result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersStableExchange error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

// power related query
/**
 * 查询全网算力
 * 无参数
 */
server.expose('queryTotalPower', (args, opt, callback) => {
  try {
    sub
      .rpcGetTotalPower()
      .then((result) => {
        console.log('queryTotalPower result:', result);
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
server.expose('queryAccountPower', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`queryAccountPower:${args[0]}`);
  const { address } = param.sender_data;

  try {
    sub
      .rpcGetAccountPower(address)
      .then((result) => {
        console.log('queryTotalPower result:', result);
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
 *      cart_ids: String array: ['001', '002']
 *    }
 * }
 */
server.expose('queryCommodityPower', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`queryCommodityPower:${args[0]}`);
  const { app_id, cart_ids } = param.sender_data;

  try {
    sub
      .rpcGetCommodityPower(app_id, cart_ids)
      .then((result) => {
        console.log('queryCommodityPower result:', result);
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
    msg: 'unknown',
  };

  // validate sender
  if (!verifyPubKey(sender_pub_key)) {
    //sendResult(callback, { error: "not valid address" });
    result.msg = 'not valid address';
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
    result.msg = 'sender sign verify fail';
    return result;
  }

  // verify app sign
  const appVerify = sub.verify(app_pub_key, util.getObjectFieldValueStr(app_data), app_sign);
  if (!appVerify.isValid) {
    // sendResult(callback, { error: "app sign verify fail" });
    result.msg = 'app sign verify fail';
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
console.log('init keyring...');
sub.initKeyring().then(() => {
  console.log('init keyring done!');
  loadKeys();

  const testJson = JSON.parse(
    `{"address":"5Gy5A6fsD4JXLVEqYp3EWqzTauLD9u5NVaSLDDDnS8rPoRDr","encoded":"0x9aa1a546e866be05bb6b47817a2f98a6ae8f83a56d4858526be5169fd014d57e78ab3a4cdc959958d1685d8b9ec5ef58edfe330b52ccbef34d3dc6070a3a0b0ce8e2170bf7394aa6fd1cf159c318fdb0e5e882a2910b17b72e79bbfd9ff6a823f608a796b02ef7a05da4d833af69645315b779232a31127767eb66d4742ace24cd073625a5cd9a4a945292bb8d90691ee44803e1e5976b37bbb9a5ed27","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"abc"}}`
  );
  sub.setupAccountByJson(testJson);
  sub.unlock(testJson.address, '123456');

  const port = config.get('port');
  server.listen(port);
  console.log(`server start on ${port}`);
});

const apiAddr = config.get('sub_endpoint');
console.log('trying to connect to:', apiAddr);

function sub_notify_cb(method, data) {
  console.log('SUB notify:', method, data);
}

sub.initApi(apiAddr, sub_notify_cb).then(() => {
  console.log('init api done!');

  // test
  // sub.rpcGetAccountPower("5GrwX4JEmrmk2RM6aTorJxzbpDWzgoifKVtHCPdjQohjRPo6").then((res) => console.log("p:", res));
  // sub.rpcGetCommodityPower("0x01", "0x01").then((res) => console.log("p:", res));

  // check dev balances
  sub.balancesAll(sub.getDevAdmin().address).then((info) => {
    console.log('dev(alice) balance:', info);
  });

  sub.balancesAll('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z').then((info) => {
    console.log('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z balance:', info);
  });

  sub.balancesAll('5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM').then((info) => {
    console.log('5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM balance:', info);
  });

  //sub.devTransfer("5HL6pXaaHffV2Wkjq2VZ3ifUz2qYuQjfTvxcizMrSpe8popg", "10000");

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
  sub.devTransfer("5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk", "2.010").then((result) => {
    console.log(result);
    console.log("end:", new Date());

    sub.balancesAll("5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk").then((info) => {
      console.log(
        "5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk balance after transfer:",
        info.transferable.toString()
      );
      console.log("transfer diff:", before.sub(info.transferable).toString());
    });
  });

  let v = sub.constBalanceExistentialDeposit();
  console.log(v);*/

  sub.rpcGetCommodityPower('a01', ['001', '002', '003345']).then((result) => {
    console.log('rpcGetCommodityPower result:', result);
  });
  /*
  let r = sub.isAccountActive('5GNeKizyUBhKUiaTEZ5CDmHvzQwjvNZq4QD46QFKqSbNE1tG');
  console.log('r:', r);

  sub.rpcCheckAccountIsModelCreator('5GNeKizyUBhKUiaTEZ5CDmHvzQwjvNZq4QD46QFKqSbNE1tG', 'a01', 'm01').then((result) => {
    console.log('rpcCheckAccountIsModelCreator:', result);
  });*/

  // sub.unlock("5CS6KGBqoNBkUMCzFSLa78Uo7TFN98xdWokaQkh8h9j1uJTf", "123456");

  /*sub
    .membersAirDropNewUserBenefit(
      sub.getDevAdmin().address,
      '5CqabEJF7UxEb5iDGSQmao4a26vJ2urPKdXghu64QgcbPDLM',
      'a01',
      'u01',
      '1'
    )
    .then((result) => {
      console.log('air drop result:', result);
    });*/

  /*sub.balancesAll('5HL6pXaaHffV2Wkjq2VZ3ifUz2qYuQjfTvxcizMrSpe8popg').then((info) => {
    console.log('5HL6pXaaHffV2Wkjq2VZ3ifUz2qYuQjfTvxcizMrSpe8popg balance:', info.transferable.toString());
  });*/
  /*sub.democracyPowerComplain(
    {},
    '5GNeKizyUBhKUiaTEZ5CDmHvzQwjvNZq4QD46QFKqSbNE1tG',
    '',
    '5GNeKizyUBhKUiaTEZ5CDmHvzQwjvNZq4QD46QFKqSbNE1tG',
    ''
  );*/

  // 5HQtHMiGpnS8NBYFRTbDq9D7XnK9eLRg8Z79ZJj5PTmZNdKu
  /*sub.rpcCheckAccountIsPlatformExpert('5HQtHMiGpnS8NBYFRTbDq9D7XnK9eLRg8Z79ZJj5PTmZNdKu', '12345678').then((result) => {
    console.log('check result:', result);
  });*/

  /*sub.queryKpDocuments().then((result) => {
    console.log('queryKpDocuments:');
  });*/

  /*sub.rpcGetCommodityPower('12345678', ['178']).then(result => {
    console.log('rpcGetCommodityPower:', result);
  });*/

  /*sub.rpcLeaderBoardLoad('12345678', '0', '880').then(result => {
    console.log('rpcLeaderBoardLoad:', result);
  });

  sub.queryLeaderBoardRecords().then((result) => {
    console.log('queryLeaderBoardRecords');
  });

  sub.queryRealtimeLeaderBoard().then((result) => {
    console.log('queryRealtimeLeaderBoard');
  });*/
});
