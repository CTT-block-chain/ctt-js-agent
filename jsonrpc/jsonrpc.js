const rpc = require('json-rpc2');
const fs = require('fs');
const sub = require('../lib/sub');
const util = require('../lib/util');
const config = require('../config/config');

const { hexToU8a, hexToString, u8aToString, u8aToBuffer } = require('@polkadot/util');

const InterfaceAppFinancedProposalParams = require('../interface/appFinancedProposalParams');
const InterfaceAppFinancedUserExchangeParams = require('../interface/appFinancedUserExchangeParams');
const InterfaceAppFinancedUserExchangeConfirmParams = require('../interface/appFinancedUserExchangeConfirmParams');

const InterfaceAddAppParams = require('../interface/addAppParams');

const InterfaceAuthParamsCreateModel = require('../interface/authParamsCreateModel');
const InterfaceClientParamsCreateModel = require('../interface/clientParamsCreateModel');

const InterfaceClientParamsCreatePublishDoc = require('../interface/clientParamsCreatePublishDoc');
const InterfaceClientParamsCreateIdentifyDoc = require('../interface/clientParamsCreateIdentifyDoc');
const InterfaceClientParamsCreateTryDoc = require('../interface/clientParamsCreateTryDoc');
const InterfaceClientParamsCreateChooseDoc = require('../interface/clientParamsCreateChooseDoc');
const InterfaceClientParamsCreateModelDoc = require('../interface/clientParamsCreateModelDoc');
const InterfaceModelExpertDelMemberParams = require('../interface/modelExpertDelMemberParams');
const InterfaceAppIncomeRedeemParams = require('../interface/appIncomeRedeemParams');
const InterfaceAppIncomeRedeemConfirmParams = require('../interface/appIncomeRedeemConfirmParams');
const powerComplain = require('../interface/powerComplain');
const ModelDispute = require('../interface/modelDispute');
const InterfaceDisableModelParams = require('../interface/disableModelParams');

const { AppFinancedProposalParams, AppFinancedUserExchangeParams, AppFinancedUserExchangeConfirmParams, CommentData,
  AddAppParams, AuthParamsCreateModel, ClientParamsCreateModel, ClientParamsCreatePublishDoc,
  ClientParamsCreateIdentifyDoc, ClientParamsCreateTryDoc, ClientParamsCreateChooseDoc, 
  ClientParamsCreateModelDoc, ModelExpertAddMemberParams, ModelExpertDelMemberParams, ModelIncomeCollectingParam, 
  AppKeyManageParams, AppIncomeRedeemParams, AppIncomeRedeemConfirmParams, DisableModelParams } = require('../lib/signParamsDefine');


const server_white_list = require('./keys/wl.json');
const { signU8a } = require('../lib/sub');

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
 * param : {"data": "xxxxx", "is_base64": "0" or "1"}
 * return: hash hex string
 */
server.expose('subHash', (args, opt, callback) => {
  try {
    let result = '';
    const param = JSON.parse(args[0]);
    if (!param.data) {
      console.log(`hash invalid params: ${param}`);
    } else {
      console.log("hash params", param.data, param.data.length);
      if (param.is_base64 === '1') {
        param.data = Buffer.from(param.data, 'base64').toString();
        console.log("decodes base64:", param.data, param.data.length);
      }
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
 *    data: { // ClientParamsCreatePublishDoc
 *      app_id: 应用ID String
 *      document_id: 文章ID  String
 *      model_id: 商品模型ID String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *      para_issue_rate: 参数发布率 String
 *      self_issue_rate: 自证参数发布率 String
 *      attend_rate: 体验参与度 String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_sign: 用户数据签名 String
 *    sender_pub_key: 发送者公钥 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subProductPublish', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductPublish:${args[0]}`);
    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    let { app_id, document_id, model_id, product_id, content_hash, para_issue_rate, self_issue_rate, attend_rate } = param.data;

    let params = InterfaceClientParamsCreatePublishDoc.create(app_id, document_id, model_id, product_id, content_hash, para_issue_rate, self_issue_rate, attend_rate);

    sub
      .createDocument(0, params, app_pub_key, app_sign, sender_pub_key, sender_sign)
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
 * product identify document
 * {
 *    data: { // ClientParamsCreateIdentifyDoc
 *      app_id: 应用ID String
 *      document_id: 文章ID  String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *      cart_id: 购物车id String
 *      goods_price: 商品价格 String
 *      ident_rate: 参数鉴别率 String
 *      ident_consistence: 鉴别核实一致性  String
 *      seller_consistence: 商家核实一致性 String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_sign: 用户数据签名 String
 *    sender_pub_key: 发送者公钥 String 
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subProductIdentify', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductIdentify:${args[0]}`);
    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { app_id, document_id, product_id, content_hash, goods_price, ident_rate, ident_consistence, seller_consistence, cart_id } = param.data;
    
    let params = InterfaceClientParamsCreateIdentifyDoc.create(app_id, document_id, product_id, content_hash, goods_price, ident_rate, ident_consistence, seller_consistence, cart_id);

    sub
      .createDocument(1, params, app_pub_key, app_sign, sender_pub_key, sender_sign)
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
 * product try document
 * {
 *    data: { // ClientParamsCreateTryDoc
 *      app_id: 应用ID String
 *      document_id: 文章ID  String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *      cart_id: 购物车id String
 *      goods_price: 商品价格 String
 *      offset_rate: 品鉴偏差率 String
 *      true_rate: 品鉴真实度 String
 *      seller_consistence: 商家核实一致性 String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_sign: 用户数据签名 String
 *    sender_pub_key: 发送者公钥 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subProductTry', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductIdentify:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { app_id, document_id, product_id, content_hash, goods_price, offset_rate, true_rate, seller_consistence, cart_id } = param.data;
    
    let params = InterfaceClientParamsCreateTryDoc.create(app_id, document_id, product_id, content_hash, goods_price, offset_rate, true_rate, seller_consistence, cart_id);

    sub
      .createDocument(2, params, app_pub_key, app_sign, sender_pub_key, sender_sign)
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
 * product choose document
 * {
 *    data: { // ClientParamsCreateChooseDoc
 *      app_id: 应用ID String
 *      document_id: 文章ID  String
 *      model_id: 商品模型ID String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *      sell_count: 销售数量 Number String
 *      try_count: 体验数量 Number String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_sign: 用户数据签名 String
 *    sender_pub_key: 发送者公钥 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subProductChooseDoc', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subProductIdentify:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { app_id, document_id, model_id, product_id, content_hash, sell_count, try_count } = param.data;

    let params = InterfaceClientParamsCreateChooseDoc.create(app_id, document_id, model_id, product_id, content_hash, sell_count, try_count);

    sub
      .createDocument(3, params, app_pub_key, app_sign, sender_pub_key, sender_sign)
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
 *    data: { // ClientParamsCreateModelDoc 
 *      app_id: 应用ID String
 *      document_id: 文章ID  String
 *      model_id: 商品模型ID String
 *      product_id: 产品ID String
 *      content_hash: 文章hash String
 *      producer_count: 生产数量 Number String
 *      product_count: 产品数量 Number String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_sign: 用户数据签名 String
 *    sender_pub_key: 发送者公钥 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subModelCreateDoc', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subModelCreateDoc:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    let { app_id, document_id, model_id, product_id, content_hash, producer_count, product_count } = param.data;

    let params = InterfaceClientParamsCreateModelDoc.create(app_id, document_id, model_id, product_id, content_hash, producer_count, product_count);

    sub
      .createDocument(4, params, app_pub_key, app_sign, sender_pub_key, sender_sign)
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
 * 创建模型 
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { // AuthParamsCreateModel
 *      model_id: 商品模型ID String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_data: {  // ClientParamsCreateModel
 *      app_id: 应用ID String
 *      expert_id: 专家ID String
 *      commodity_name: 商品名称 String
 *      commodity_type: 商品类型 String
 *      content_hash: String
 *    }
 *    app_sign: 用户数据签名 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subModelCreate', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subModelOperate:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { app_id, expert_id, commodity_name, commodity_type, content_hash } = param.app_data;
    const { model_id } = param.sender_data;

    
    let clientParams = InterfaceClientParamsCreateModel.create(app_id, expert_id, commodity_name, commodity_type, content_hash);
    let authParams = InterfaceAuthParamsCreateModel.create(model_id);

    sub.createModel(clientParams, authParams, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log('subModelCreate result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subModelCreate error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 取消模型 
 * {
 *    data: {
 *      app_id: 应用ID String
 *      model_id: 商品模型ID String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_sign: 用户数据签名 String
 *    sender_pub_key: 发送者公钥 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('subModelDisable', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`subModelDisable:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { app_id, model_id } = param.data;
    
    let params = InterfaceDisableModelParams.create(app_id, model_id);

    sub.disableModel(params, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log('subModelDisable result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`subModelDisable error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 应用等值赎回
 * {
 *    sender_pub_key: 发送者公钥 String
 *    sender_data: { 发送端数据
 *      app_id: 应用ID String
 *    }
 *    app_pub_key: 应用公钥 String
 *    app_data: {  应用数据
 *      amount: String 等值赎回金额,例如 “23.5”
 *      cash_transaction_id: String 现金交易ID
 *    }
 *    app_sign: 用户数据签名 String
 *    sender_sign: 发送者签名 String
 * } 
 */
server.expose('appRedeemKpt', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`appRedeemKpt:${args[0]}`);

    const { sender_pub_key, app_pub_key, app_sign, sender_sign } = param;
    const { app_id } = param.sender_data;
    const { amount, cash_transaction_id } = param.app_data;

    const verifyResult = verifyServerSign(param);

    if (!verifyResult.isOk) {
      sendResult(callback, { error: verifyResult.msg });
      return;
    }

    sub.appRedeemKpt(app_id, amount, cash_transaction_id, app_pub_key, app_sign, sender_pub_key, sender_sign)
      .then((result) => {
        console.log('appRedeemKpt result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`appRedeemKpt error: ${e}`);
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

/**
 * 查询账户可兑换融资额度
 * {
 *    sender_data: { 发送端数据
 *      address: 账户地址 String
 *      appId: 应用ID Number String
 *      proposalId: 融资提案标识 String
 *    }
 *    返回值： 本次可兑换额度，只含整数部分 例如 '135'
 * }
 */
server.expose('queryAppFinancedPortion', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`queryAppFinancedPortion:${args[0]}`);
    const { address, appId, proposalId } = param.sender_data;

    sub
      .queryAppFinancedUserPortion(address, appId, proposalId)
      .then((result) => {
        console.log('queryAppFinancedPortion result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryAppFinancedPortion error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询账户可兑换应用提成额度
 * {
 *    sender_data: { 发送端数据
 *      address: 账户地址 String
 *      appId: 应用ID Number String
 *      cycle: 期数索引 Number 可选，如不传，则查询最近一期
 *    }
 *    返回值： 
 *    {
 *       portion: String 可兑换额度（元）
 *       cycle: Number 查询期数索引 
 *    }
 * }
 */
server.expose('queryAppCycleIncomeUserPortion', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`queryAppCycleIncomeUserPortion:${args[0]}`);
    const { address, appId, cycle } = param.sender_data;

    sub
      .queryAppCycleIncomeUserPortion(address, appId, cycle)
      .then((result) => {
        console.log('queryAppCycleIncomeUserPortion result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryAppCycleIncomeUserPortion error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询指定融资提案下的兑换账户列表数据
 * {
 *    sender_data: { 发送端数据
 *      appId: 应用ID Number String
 *      proposalId: 融资提案标识 String
 *    }
 *    返回值： [{
 *       account: 兑换账户地址 String
 *       exchange_amount: 兑换数量 String
 *       status: 兑换状态 "1": 用户已提交申请，并锁定相应KTP, "2": 已确认兑换，并燃烧锁定KPT 
 *       pay_id: 支付单号 String
 *    }]
 * }
 */
server.expose('queryAppFinanceExchangeRecords', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`queryAppFinanceExchangeRecords:${args[0]}`);
    const { appId, proposalId } = param.sender_data;

    sub
      .getAppFinanceExchangeRecords(appId, proposalId)
      .then((result) => {
        console.log('queryAppFinanceExchangeRecords result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryAppFinanceExchangeRecords error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询指定周期下的兑换账户列表数据
 * {
 *    sender_data: { 发送端数据
 *      appId: 应用ID Number String
 *      cycle: 兑换期数 Number String
 *    }
 *    返回值： [{
 *       account: 兑换账户地址 String
 *       exchange_amount: 兑换数量 String
 *       status: 兑换状态 "1": 用户已提交申请，并锁定相应KTP, "2": 已确认兑换，并燃烧锁定KPT 
 *       pay_id: 支付单号 String
 *    }]
 * }
 */
server.expose('queryAppIncomeExchangeRecords', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`queryAppIncomeExchangeRecords:${args[0]}`);
    const { appId, cycle } = param.sender_data;

    sub
      .getAppIncomeExchangeRecords(Number(appId), Number(cycle))
      .then((result) => {
        console.log('queryAppIncomeExchangeRecords result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryAppIncomeExchangeRecords error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 应用融资提案
 * {
 *    data: { 
 *      account: 融资账户公钥
 *      app_id: 应用ID Number String
 *      proposal_id: 融资提案标识 String
 *      amount: 融资KPT
 *      exchange: 融资法币
 *    }
 *    user_key: 用户账户公钥 String (投资者账户)
 *    user_sign: 用户数据签名 String
 *    auth_key: 授信服务器以及发送者公钥 String
 *    auth_sign: 授信签名
 * }
 */
server.expose('democracyAppFinanced', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`democracyAppFinanced:${args[0]}`);
    const { data, user_key, user_sign, auth_key, auth_sign } = param;
    
    let financedParams = sub.createSignObject('AppFinancedProposalParams', data);

    // verify sign
    let buf = InterfaceAppFinancedProposalParams.encode(financedParams);
    let verify = sub.verify(auth_key, buf, auth_sign);
    if (!verify.isValid) {
      const msg = 'sign verify fail for auth';
      console.error(msg);
      sendResult(callback, { error: msg });
      return
    }

    verify = sub.verify(user_key, buf, user_sign);
    if (!verify.isValid) {
      const msg = 'sign verify fail for user';
      console.error(msg);
      sendResult(callback, { error: msg });
      return
    }

    sub
      .democracyAppFinanced(financedParams, user_key, user_sign, auth_key, auth_sign)
      .then((result) => {
        console.log('democracyAppFinanced result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`democracyAppFinanced error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 注册应用提案
 * {
 *    app_data: { 
 *      app_type: 应用类型 （通过queryAppTypes 获取可用类型）String
 *      app_name: 应用名称 String
 *      app_key: 应用身份公钥 String
 *      app_admin_key: 应用管理公钥 String （确保该账户满足最小抵押）
 *      return_rate：返点比例 '0' - '9999'  万分比 例如 ‘100’ 为 100/10000 即 1% String
 *    }
 *    user_key: 用户账户公钥 String (appAdminKey)
 *    user_sign: 用户数据签名 String
 * }
 */
server.expose('democracyAddApp', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`democracyAddApp:${args[0]}`);
    const { app_data, user_key, user_sign } = param;

    let interfaceData = sub.createSignObject('AddAppParams', app_data);
    
    sub
      .democracyAddApp(interfaceData, user_key, user_sign)
      .then((result) => {
        console.log('democracyAddApp result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`democracyAddApp error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 用户融资兑换申请
 * {
 *    data: { 
 *      account: user_pub_key
 *      app_id: 应用ID Number String
 *      proposal_id: 融资提案标识 String
 *      amount: 兑换KPT（经过了用户端提交及服务端校验的可兑换额度）
 *    }
 *    user_key: 用户账户公钥 String (投资者账户)
 *    user_sign: 用户数据签名 String
 *    auth_key: 授信服务器以及发送者公钥 String
 *    auth_sign: 授信签名
 * }
 */
server.expose('appFinancedUserExchangeRequest', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`appFinancedUserExchangeRequest:${args[0]}`);
    const { data, user_key, user_sign, auth_key, auth_sign } = param;
    
    let signObj = sub.createSignObject(AppFinancedUserExchangeParams, data);

    // verify sign
    let buf = InterfaceAppFinancedUserExchangeParams.encode(signObj);
    let verify = sub.verify(auth_key, buf, auth_sign);
    if (!verify.isValid) {
      const msg = 'sign verify fail for auth';
      console.error(msg);
      sendResult(callback, { error: msg });
      return
    }

    verify = sub.verify(user_key, buf, user_sign);
    if (!verify.isValid) {
      const msg = 'sign verify fail for user';
      console.error(msg);
      sendResult(callback, { error: msg });
      return
    }

    sub
      .appFinancedUserExchangeRequest(signObj, user_key, user_sign, auth_key, auth_sign)
      .then((result) => {
        console.log('appFinancedUserExchangeRequest result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`appFinancedUserExchangeRequest error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 用户融资兑换确认
 * {
 *    data: {
 *      account: 用户账户公钥
 *      app_id: 应用ID Number String
 *      proposal_id: 融资提案标识 String
 *      pay_id: 支付号 String
 *    }
 *    auth_key: 授信服务器以及发送者公钥 String
 * }
 */
server.expose('appFinancedUserExchangeConfirm', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`appFinancedUserExchangeConfirm:${args[0]}`);
    const { data, auth_key } = param;
    
    let signObj = sub.createSignObject(AppFinancedUserExchangeConfirmParams, data);

    sub
      .appFinancedUserExchangeConfirm(signObj, auth_key)
      .then((result) => {
        console.log('appFinancedUserExchangeConfirm result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`appFinancedUserExchangeConfirm error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 提交周期模型收入
 * {
 *    data: {
 *      app_id: 应用ID Number String
 *      incomes: [ 模型收入JSON数组，最大不超过10个
 *        {
 *           model_id: 模型ID
 *           income: 周期收入，单位元，String, 例如 "123.45"
 *        },
 *        ...
 *      ]
 *    },
 *    user_key: 用户账户公钥 String (应用管理账户)
 *    user_sign: 用户数据签名 String
 *    auth_key: 授信服务器以及发送者公钥（技术委员会） String
 *    auth_sign: 授信签名   
 * }
 */
server.expose('modelIncomesSubmit', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`modelIncomesSubmit:${args[0]}`);
    const { data, user_key, user_sign, auth_key, auth_sign } = param;
    
    let signObj = sub.createSignObject(ModelIncomeCollectingParam, data);

    sub
      .setBatchModelPeriodIncome(signObj, user_key, user_sign, auth_key, auth_sign)
      .then((result) => {
        console.log('modelIncomesSubmit result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`modelIncomesSubmit error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询模型增发奖励当前阶段
 * 返回值：{
 *  stage: '0':周期未结束 '1':模型收入统计中 '2':奖励申领阶段
 *  left_seconds: 该阶段剩余的秒数
 * }
 */
server.expose('queryCurrentModelRewardStage', (args, opt, callback) => {
  try {
    sub
      .rpcModelIncomeCurrentStage()
      .then((result) => {
        console.log('queryCurrentModelRewardStage result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryCurrentModelRewardStage error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 应用分成用户兑换申请
 * {
 *    data: { 
 *      account: user_pub_key
 *      app_id: 应用ID Number String
 *      cycle: 模型增发周期 String
 *      exchange_amount: 兑换KPT（经过了用户端提交及服务端校验的可兑换额度）
 *    }
 *    user_key: 用户账户公钥 String
 *    user_sign: 用户数据签名 String
 *    auth_key: 授信服务器以及发送者公钥 String
 *    auth_sign: 授信签名
 * }
 */
server.expose('appIncomeUserExchangeRequest', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`appIncomeUserExchangeRequest:${args[0]}`);
    const { data, user_key, user_sign, auth_key, auth_sign } = param;
    
    let signObj = sub.createSignObject(AppIncomeRedeemParams, data);

    // verify sign
    let buf = InterfaceAppIncomeRedeemParams.encode(signObj);
    let verify = sub.verify(auth_key, buf, auth_sign);
    if (!verify.isValid) {
      const msg = 'sign verify fail for auth';
      console.error(msg);
      sendResult(callback, { error: msg });
      return
    }

    verify = sub.verify(user_key, buf, user_sign);
    if (!verify.isValid) {
      const msg = 'sign verify fail for user';
      console.error(msg);
      sendResult(callback, { error: msg });
      return
    }

    sub
      .appIncomeUserExchangeRequest(signObj, user_key, user_sign, auth_key, auth_sign)
      .then((result) => {
        console.log('appIncomeUserExchangeRequest result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`appIncomeUserExchangeRequest error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 应用分成用户兑换确认
 * {
 *    data: {
 *      account: 用户账户公钥
 *      app_id: 应用ID Number String
 *      cycle: 模型增发周期 String
 *      pay_id: 支付号 String
 *    }
 *    auth_key: 授信服务器以及发送者公钥 String
 * }
 */
server.expose('appIncomeUserExchangeConfirm', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`appIncomeUserExchangeConfirm:${args[0]}`);
    const { data, auth_key } = param;
    
    let signObj = sub.createSignObject(AppIncomeRedeemConfirmParams, data);

    sub
      .appIncomeUserExchangeConfirm(signObj, auth_key)
      .then((result) => {
        console.log('appIncomeUserExchangeConfirm result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`appIncomeUserExchangeConfirm error: ${e}`);
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
 *    data: {  应用数据
 *      app_id: 应用ID String
 *      model_id: 商品模型ID String
 *      member: 待删除成员公钥 String
 *    }
 *    app_pub_key: 用户公钥 String
 *    app_sign: 用户数据签名 String
 *    sender_pub_key: 发送者公钥 String
 *    sender_sign: 发送者签名 String
 * }
 */
server.expose('membersRemoveExpertByCreator', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersRemoveExpertByCreator:${args[0]}`);
    const { sender_pub_key, sender_sign, app_pub_key, app_sign } = param;
    const { app_id, model_id, member } = param.data;

    let params = InterfaceModelExpertDelMemberParams.create(app_id, model_id, member);
    
    sub
      .membersRemoveExpertByCreator(
        params,
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
 * }
 */
server.expose('membersAddInvestor', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersAddInvestor:${args[0]}`);
    const { sender_pub_key, sender_data } = param;
    const { app_id, investor } = sender_data;

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

/**
 * 增加应用admin
 * {
 *    app_key: 应用身份密钥地址 String
 *    sender_data: { 发送端数据
 *      admin: 应用管理密钥地址, String
        app_id: 应用ID, Number or String
        member: 新增管理地址, String
 *    }
 *    admin_sign: 应用管理密钥签名 String
 * }
 */
server.expose('membersAddAppAdmin', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersAddAppAdmin:${args[0]}`);
    const { app_key, sender_data, admin_sign } = param;
    
    let signObj = sub.createSignObject(AppKeyManageParams, sender_data);

    sub
      .membersAddAppAdmin(app_key, signObj, admin_sign)
      .then((result) => {
        console.log('membersAddAppAdmin result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersAddAppAdmin error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 删除应用admin
 * {
 *    app_key: 应用身份密钥地址 String
 *    sender_data: { 发送端数据
 *      admin: 应用管理密钥地址, String
        app_id: 应用ID, Number or String
        member: 待移除地址, String
 *    }
 *    admin_sign: 应用管理密钥签名 String
 * }
 */
server.expose('membersRemoveAppAdmin', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersRemoveAppAdmin:${args[0]}`);
    const { app_key, sender_data, admin_sign } = param;
    
    let signObj = sub.createSignObject(AppKeyManageParams, sender_data);

    sub
      .membersRemoveAppAdmin(app_key, signObj, admin_sign)
      .then((result) => {
        console.log('membersRemoveAppAdmin result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersRemoveAppAdmin error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 增加应用身份
 * {
 *    app_key: 应用身份密钥地址 String
 *    sender_data: { 发送端数据
 *      admin: 应用管理密钥地址, String
        app_id: 应用ID, Number or String
        member: 新增身份地址, String
 *    }
 *    admin_sign: 应用管理密钥签名 String
 * }
 */
server.expose('membersAddAppKey', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersAddAppKey:${args[0]}`);
    const { app_key, sender_data, admin_sign } = param;
    
    let signObj = sub.createSignObject(AppKeyManageParams, sender_data);

    sub
      .membersAddAppKey(app_key, signObj, admin_sign)
      .then((result) => {
        console.log('membersAddAppKey result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersAddAppKey error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 移除应用身份
 * {
 *    app_key: 应用身份密钥地址 String
 *    sender_data: { 发送端数据
 *      admin: 应用管理密钥地址, String
        app_id: 应用ID, Number or String
        member: 待移除地址, String
 *    }
 *    admin_sign: 应用管理密钥签名 String
 * }
 */
server.expose('membersRemoveAppKey', (args, opt, callback) => {
  try {
    const param = JSON.parse(args[0]);
    console.log(`membersRemoveAppKey:${args[0]}`);
    const { app_key, sender_data, admin_sign } = param;
    
    let signObj = sub.createSignObject(AppKeyManageParams, sender_data);

    sub
      .membersRemoveAppKey(app_key, signObj, admin_sign)
      .then((result) => {
        console.log('membersRemoveAppKey result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`membersRemoveAppKey error: ${e}`);
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

/**
 * 查询体验商品是否在黑名单
 * {
 *    sender_data: { 发送端数据
 *      app_id:  String or Number
 *      cart_id: String
 *    }
 *  return: bool (true or false)
 * }
 */
server.expose('isCommodityInBlackList', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`isCommodityInBlackList:${args[0]}`);
  const { app_id, cart_id } = param.sender_data;

  try {
    sub
      .rpcIsCommodityInBlackList(app_id, cart_id)
      .then((result) => {
        console.log('isCommodityInBlackList result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`isCommodityInBlackList error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询应用类型
 * 无参数
 */
server.expose('queryAppTypes', (args, opt, callback) => {
  try {
    sub
      .queryAppTypes()
      .then((result) => {
        console.log('queryAppTypes result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryAppTypes error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 判断当前是否能够发起融提案
 * 无参数
 */
server.expose('isPermitSubmitAppFinance', (args, opt, callback) => {
  try {
    sub
      .isPermitSubmitAppFinance()
      .then((result) => {
        console.log('isPermitSubmitAppFinance result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`isPermitSubmitAppFinance error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 获取当前注册应用数据
 * 无参数
 * 返回值：[
 *     {
 *       app_id: '100000001',
 *       name: '减法app-3',
 *       stake: '0',
 *       return_rate: '30'
 *     }
 * ]
 */
server.expose('queryApps', (args, opt, callback) => {
  try {
    sub
      .queryApps()
      .then((result) => {
        console.log('queryApps result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryApps error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * sender_data: { 发送端数据
 *      account:  String
 *      msg: String 签名内容
 *      sign: String 签名 0x
 *    }
 * 返回值 true or false
 */
server.expose('isTechMemberSign', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`isTechMemberSign:${args[0]}`);
  const { account, msg, sign } = param.sender_data;

  try {
    sub
      .rpcIsTechMemberSign(account, msg, sign)
      .then((result) => {
        console.log('isTechMemberSign result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`isTechMemberSign error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询模型复议结果
 * sender_data: { 发送端数据
 *      app_id, Number or String
 *      comment_id, 评论ID String
 *    }
 */
server.expose('queryModelDisputeRecord', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`queryModelDisputeRecord:${args[0]}`);
  const { app_id, comment_id } = param.sender_data;

  try {
    sub
      .rpcModelDisputeRecord(Number(app_id), comment_id)
      .then((result) => {
        console.log('queryModelDisputeRecord result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryModelDisputeRecord error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询算力投诉结果
 * sender_data: { 发送端数据
 *      app_id, Number or String
 *      comment_id, 评论ID String
 *    }
 */
server.expose('queryCommodityPowerSlashRecord', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`queryCommodityPowerSlashRecord:${args[0]}`);
  const { app_id, comment_id } = param.sender_data;

  try {
    sub
      .rpcCommodityPowerSlashRecord(Number(app_id), comment_id)
      .then((result) => {
        console.log('queryCommodityPowerSlashRecord result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryCommodityPowerSlashRecord error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询所有提案
 * 返回值:
 * {
 *  pending: [
 *    {
 *      index: '32',
 *      hash: '0x8c7d56116584f65b3164a167136ab63546f94ea688ffe278c0d4f7f283c63cf6'
 *    }
 *  ],
 *  referendum: {
 *    index: '32',
 *    hash: '0x8c7d56116584f65b3164a167136ab63546f94ea688ffe278c0d4f7f283c63cf6'
 *  }
 * }
 */
server.expose('fetchAllProposals', (args, opt, callback) => {
  try {
    sub
      .fetchAllProposals()
      .then((result) => {        
        console.log('fetchAllProposals result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`fetchAllProposals error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询区块高度
 */
server.expose('queryBlockHeight', (args, opt, callback) => {
  try {
    sub
      .queryBlockHeight()
      .then((result) => {        
        console.log('queryBlockHeight result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryBlockHeight error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询区块时间
 * sender_data: { 发送端数据
 *   block, 区块号 Number
 * }
 */
server.expose('queryBlockTime', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`queryBlockTime:${args[0]}`);
  const { block } = param.sender_data;

  try {
    sub
      .queryBlockTime(Number(block))
      .then((result) => {        
        console.log('queryBlockTime result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryBlockTime error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询公投时间参数
 * 返回值：（区块数)
 * { 
 *   launchPeriod: '300',  // 启动周期 
 *   enactmentPeriod: '100', // 执行延后时间
 *   votingPeriod: '100' // 投票时间
 * }
 */
server.expose('queryDemocracyParams', (args, opt, callback) => {
  try {
    result = sub.queryDemocracyParams();
    console.log('queryDemocracyParams result:', result);
    sendResult(callback, { result });
  } catch (e) {
    console.error(`queryDemocracyParams error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});

/**
 * 查询技术委员会成员
 * 返回值：
 * [
      '5EqWxvQqD2PriHPSPUWyVpqYR34RhopaPYZ1xFaF1GV2gUwL',
      '5FcBV9rczxcFLYFhxkuYnWHVi8UTt9DMqxhwkps1xeRgX7dP',
      '5FenQHhRgGfqYgJtTYLWz8u31tmznv2XV8qiXNpNBKScZT1t',
      '5HQtHMiGpnS8NBYFRTbDq9D7XnK9eLRg8Z79ZJj5PTmZNdKu'
    ]
 */
server.expose('queryTechMembers', (args, opt, callback) => {
  try {
    sub
      .queryTechMembers()
      .then((result) => {        
        console.log('queryTechMembers result:', result);
        sendResult(callback, { result });
      })
      .catch((err) => {
        sendResult(callback, { error: err });
      });
  } catch (e) {
    console.error(`queryTechMembers error: ${e}`);
    sendResult(callback, { error: e.message });
  }
});


// signer interfaces
/**
 * signParams 参数签名
 * {
 *    params_type: 类型 String 例如 CommentData
 *    params_data: 数据，对于不同params_type, params_data不同
 *    signer_address: 签名账户地址，确保已经加载
 *    ---------------------------------------------------
 *    curl example:
 *    curl -X POST \
 *    -H 'Content-Type: application/json' \
 *    -d '{"jsonrpc":"2.0","id":"id","method":"signParams","params":["{\"params_type\":\"CommentData\",\"params_data\":{\"app_id\":\"1000\",\"document_id\":\"123\",\"comment_id\":\"1234\",\"comment_hash\":\"0x998e22798b83792ab29ae246dc7d9f694be6d47ada6fd5f0014b662e2e609e76\",\"comment_fee\":\"0.01\",\"comment_trend\":\"0\"},\"signer_address\":\"5FcBV9rczxcFLYFhxkuYnWHVi8UTt9DMqxhwkps1xeRgX7dP\"}"]}' \
 *    http://39.106.116.92:5080 
 *    ---------------------------------------------------
 *    对于 params_type 是 "CommentData":
 *    params_data 传入以下JSON:
 *    {
 *      "app_id": "1000"
 *      "document_id": "123"
 *      "comment_id": "123" 
 *      "comment_hash" "0xxxx" 
 *      "comment_fee": "0.01" 
 *      "comment_trend" "0"
 *    }    
 * }
 */
server.expose('signParams', (args, opt, callback) => {
  const param = JSON.parse(args[0]);
  console.log(`signParams:${args[0]}`);
  const { params_type, params_data, signer_address } = param;

  let interfaceObj = sub.createSignObject(params_type, params_data);
  if (!interfaceObj) {
      console.error("signParams unknown type:", params_type);
      sendResult(callback, { error: "unknown type"});
      return;
  }

  try {
    result = sub.paramsSign(params_type, interfaceObj, signer_address);
    console.log('signParams result:', result);
    sendResult(callback, { result });      
  } catch (e) {
    console.error(`signParams error: ${e}`);
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
let sudojson = fs.readFileSync("./jsonrpc/keys/sudo.json");
if (sudojson) {
  sudojson = JSON.parse(sudojson);
  //console.log(sudojson);
}

sub.initKeyring(sudojson, sudojson.pwd).then(() => {
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

  /*ub.balancesAll('5EqWxvQqD2PriHPSPUWyVpqYR34RhopaPYZ1xFaF1GV2gUwL', 11103).then((info) => {
    console.log('5EqWxvQqD2PriHPSPUWyVpqYR34RhopaPYZ1xFaF1GV2gUwL balance:', info);
  });*/

  /*sub.getOwnStashInfo('5EqWxvQqD2PriHPSPUWyVpqYR34RhopaPYZ1xFaF1GV2gUwL').then((info) => {
    console.log('5EqWxvQqD2PriHPSPUWyVpqYR34RhopaPYZ1xFaF1GV2gUwL getOwnStashInfo:', JSON.stringify(info));
  });*/

  //sub.accountInfo('5CtySW8czRJAFznj5iGqA4PNWv74zzMFZwRsDgMxfonUo5RZ', 16035).then(result => console.log("accountInfo:", result.toHuman()));
 
  // test
  // sub.rpcGetAccountPower("5GrwX4JEmrmk2RM6aTorJxzbpDWzgoifKVtHCPdjQohjRPo6").then((res) => console.log("p:", res));
  // sub.rpcGetCommodityPower(100000001, ["185"]).then((res) => console.log("rpcGetCommodityPower:", res));

  // check dev balances
  /*sub.balancesAll(sub.getDevAdmin().address).then((info) => {
    console.log('dev(alice) balance:', info);
  });

  sub.balancesAll('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z').then((info) => {
    console.log('5EYCAe5ijiYfyeZ2JJCGq56LmPyNRAKzpG4QkoQkkQNB5e6Z balance:', info);
  });

  sub.balancesAll('5EWfrDLxovYSxL16VZzbUbQjWjzzkk7ttrRxseJonhFfqhXE').then((info) => {
    console.log('5EWfrDLxovYSxL16VZzbUbQjWjzzkk7ttrRxseJonhFfqhXE balance:', info);
  });*/

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

  /*sub.rpcGetCommodityPower('a01', ['001', '002', '003345']).then((result) => {
    console.log('rpcGetCommodityPower result:', result);
  });*/
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
    {app_id: 1, cart_id: "001", comment_id: "001"},
    sub.getDevAdmin().address
  ).then(result => console.log("democracyPowerComplain:", result));*/

  // 5HQtHMiGpnS8NBYFRTbDq9D7XnK9eLRg8Z79ZJj5PTmZNdKu   
  /*sub.rpcCheckAccountIsPlatformExpert('5HQtHMiGpnS8NBYFRTbDq9D7XnK9eLRg8Z79ZJj5PTmZNdKu', '12345678').then((result) => {
    console.log('check result:', result);
  });*/

  /*sub.queryKpDocuments().then((result) => {
    console.log('queryKpDocuments:');
  });*/

  /*sub.queryKpComments().then(result => {
    console.log("comments:", result);
  });*/

  //sub.queryKpDocumentPower().then(result => console.log("queryKpDocumentPower:", result));
/*
  sub.queryAccountAttendPower().then(result => console.log("queryAccountAttendPower:", result));

  sub.queryAccountCommentStat().then(result => console.log("queryAccountCommentStat:", result));
*/
  //sub.queryCommodityPower().then(result => console.log("queryCommodityPower:", result));
/*
  /*let msg = "hello";
  let sign = sub.sign(sub.getDevAdmin().address, msg);
  sub.rpcIsTechMemberSign(sub.getDevAdmin().address, msg, sign).then(result => {
    console.log("rpcIsTechMemberSign result:", result);
  })*/

  /*sub.rpcGetCommodityPower('100000001', ['174']).then(result => {
    console.log('rpcGetCommodityPower:', result);
  });*/

  /*sub.rpcLeaderBoardLoad('12345678', '0', '880').then(result => {
    console.log('rpcLeaderBoardLoad:', result);
  });*/

  /*sub.queryLeaderBoardRecords().then((result) => {
    console.log('queryLeaderBoardRecords');
  });*/

  /*sub.queryRealtimeLeaderBoard().then((result) => {
    console.log('queryRealtimeLeaderBoard');
  });*/

  /*sub.rpcStakeToVote("5FcBV9rczxcFLYFhxkuYnWHVi8UTt9DMqxhwkps1xeRgX7dP", "99").then(result => {
    console.log("rpcStakeToVote result:", result);
  });

  sub.queryAccountCommodities().then(result => {});*/

  /*sub.rpcLeaderBoardLoad('12345678', '36', '53836').then(result => {
    console.log('rpcLeaderBoardLoad:', result);
  });*/

  /*sub.queryLeaderBoardRecords().then((result) => {
    console.log('queryLeaderBoardRecords');
  });*/

  /*sub.queryRealtimeLeaderBoard().then((result) => {
    console.log('queryRealtimeLeaderBoard');
  });*/

  /*sub.createPowerLeaderBoard('12345678', '').then(result => {
    console.log('createPowerLeaderBoard:', result);
  })*/

  /*sub.queryAccountInfoWithBlockNum('5HdvEEyHXxKHWt15LizRBEWkL8N3BozGwziXa23k5xEGS7xw', 2953).then(result => {});
  sub.queryTotalIssuance();

  sub.rpcAppFinanceRecord('1000', 'abc');*/

  /*sub.queryAppTypes().then(result => {
    console.log("result:", result);
  })*/

  //sub.test();
  /*sub.queryModelCycleIncomeRewardStore().then(result => {
    console.log('queryModelCycleIncomeRewardStore:', JSON.stringify(result));
  })*/

  // test democracy
  /*let addApp = sub.createSignObject('AddAppParams', {
    app_type: 'commodity_general', 
    app_name: 'mytest', 
    app_key: sub.getDevAdmin().address, 
    app_admin_key: sub.getDevAdmin().address, 
    return_rate: '10'
  });

  let sign = sub.paramsSign('AddAppParams', addApp, sub.getDevAdmin().address);

  sub.democracyAddApp(addApp, sub.getDevAdmin().address, sign).then(result => {
    console.log('result:', result);
  })*/

  //sub.queryAppFinancedUserPortion(sub.getDevAdmin().address, '100000001', '1608889493000').then(result => {});
  //sub.queryAppFinancedRecords();

  /*let json = JSON.parse('{"encoded":"Fx2EJWx3L6MB3ojlDa0zMNQKX0NZ6KNITTQg3pqQQlsAgAAAAQAAAAgAAAABapNIRzhJEtGn744N94RucYcbFTUbtAa0CG2DeoZCCVtkIKp6CHTP+85wvl75WyBDx83bW8k/vLj6qcDRq6O3hdUsb9ok7VQpu2U5Bka1u0sc2x5lS6SYTEbh9t+Ova38VhSvsXcPBS4F4og3sKMJ+KmVLOtYl7OtH8jtjRQTdVWnrrZ4UwIDAQgUCcxNUjFXh5kOM2noDey4ACXM","meta":{"name":"oNVB19","userId":100072},"encoding":{"content":["pkcs8","sr25519"],"version":"3","type":["scrypt","xsalsa20-poly1305"]},"address":"5Fe1ycrky9cggGuyTP9jqLmq1PsoWnnLn11gseyUMhdsAiHW"}');
  sub.setupAccountByJson(json);
  sub.unlock(json.address, '123456');

  let data = JSON.parse('{"account":"5Fe1ycrky9cggGuyTP9jqLmq1PsoWnnLn11gseyUMhdsAiHW","app_id":"100000001","proposal_id":"1608958475000","exchange":"10","amount":"1000000"}');

  let signObj = sub.createSignObject(AppFinancedProposalParams, data);
  console.log("signObj:", signObj);

  let sign = sub.paramsSign(AppFinancedProposalParams, signObj, json.address);
  console.log('sign:', sign);

  let testSign = '0x6e0302a5ec20d4a00f4c87925b2a35d764b96ae405359975847be9fd65bb3f3dc98649af78f6d5ce66bfeabd2ec023e7c53bf2a963e9c14e862fd1fda188b087';
  let authSign = '0x02f5751434ab81f8bcb54235747e3370e99c443f253f33af3a78dec2e571ef0e41b3bf9a75d9f3d475183a4030a6f52dd9b987112cdb24c57b5961ec5e303d85';

  let u8a = InterfaceAppFinancedProposalParams.encode(signObj);
  let verify = sub.verify('5Fe1ycrky9cggGuyTP9jqLmq1PsoWnnLn11gseyUMhdsAiHW', u8a, testSign);
  console.log("verify:", verify);*/

  //sub.rpcAppFinanceRecord('100010001', 'testp-Tue Dec 29 2020 16:01:44 GMT+0800 (中国标准时间)');

  //sub.queryAppFinancedUserPortion(sub.getDevAdmin().address, '100000001', '1608971556000');

  /*sub.getAppFinanceExchangeRecords('100000001', '1608971556000').then(result => {
    console.log("result:", result);
  });*/

  //sub.isPermitSubmitAppFinance().then(result => console.log("isPermitSubmitAppFinance:", result));

  // test sign
  /*let params_data = {
    app_id: '10000',
    incomes: [
      {
        model_id: 'abc',
        income: '123.5'
      },
      {
        model_id: 'abc2',
        income: '1123.5'
      },
      {
        model_id: 'abc3',
        income: '11233.5'
      }
    ]
  };
  let interfaceObj = sub.createSignObject('ModelIncomeCollectingParam', params_data);
  let result = sub.paramsSign('ModelIncomeCollectingParam', interfaceObj, sub.getDevAdmin().address);
  console.log('result:', result);*/

  //sub.rpcModelIncomeCurrentStage().then(result => console.log("result:", result));

  //sub.queryKpModels();

  /*sub.rpcAppFinanceExchangeData(100, 'x', "5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk").then(result => {
    console.log('rpcAppFinanceExchangeData result:', result);
  })*/


  /*const testJson = JSON.parse(
    `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
  );
  sub.setupAccountByJson(testJson);
  sub.unlock(testJson.address, '123456');

  sub.balancesAll(testJson.address).then(result => {
    console.log("before b:", result);

    sub.requestModelCycleReward('100010006', 'M02-1609390647866', testJson.address).then(result => {
      sub.balancesAll(testJson.address).then(result => {
        console.log("after:", result);
      });
    });
  })*/

  //const testStr = `稻谷花香，民以食为天 - 记大米模型的发布稻谷与大米大米是我们的传统主食，认识大米，让我们从标准开始。\n国家标准中，与大米有关的标准类型，有如下几个类别。\n大米是我们的传统主食，认识大米，让我们从标准开始。\n国家标准中，与大米有关的标准类型，有如下几个类别。\n首先是产品标准，有稻谷国家标准和大米国家标准，这是通用标准，是国家强制执行的；任何大米生产类企业都需要遵守。\n一类是地方或者产地标准，具有本地特色，如规定了稻谷品种，育种、耕作方式等等。一般来讲，地方标准，特别是地理标志产品标准， 要求明显要多于国家强制标准。产品标准是大米产品参数模型的主要遵守依据第二类标准，是稻谷或者大米的检测标准，是针对产品标准里的具体指标，国家制定的检测检验方法和基础比较数据。这类标准是我们建立稻谷、大米检测与鉴别的主要依据。消费者用这个模型来进行在线鉴别与检测。\n第三类标准是大米的品尝与评价标准。目前，我们国家优质稻谷品种的标准中，包含了加工性能、营养功能与食用品尝几个方面，这种方式是以稻谷品种而不是大米为评价对象的；同时，国家标准中还制定了专门的食用品尝标准，主要针对大米感官与品尝评价的。\n在制作大米模型的过程中，我们发现，所有的国内外大米标准中，中国的大米资料是最全面、也是最多的，国内对大米研究，涵盖高产、高质与存储等等方面，但日本是最精细的，特别强调食用品尝与味道。我们的模型制作正是基于这两个国家的标准大米品质的确定“减法”app的要求中，大米模型由大米参数模型、检测与鉴别模型，品尝评估模型组成，其中产品参数模型描述的是生产商发布的大米产品参数，大米检测与鉴别模型则是用于检验生产商产品参数描述的真实性，而品尝与评估模型完全是从消费者口感角度，来评估大米食用品质与感受的。\n国家标准中，大米的品质依次有加工品质，外观品质，营养品质与食用品尝品质四个方面。几种品质之间有一些内在关联，但现代科技研究成果表明，这种关系并不绝对。其中：\n加工品质主要是大米的加工性能，出米率等等，与品质关系不是很大，但与经济价值，和加工成本有关。育种方式，分为常规稻，杂交稻，超级杂交稻，转基因等等。从自然规律来说，高产与优质是矛盾的。所以，日本稻谷强调长期自然选择的常规稻，而我们则强调高产，不管哪种方式，都具有相应的价值。至于耕作耘方式，有机、绿色、无公害等等都是国家允许的方式，没有绝对品质之分，但成本不同，不同人群可以选用不同的耕作方式。多少付出，才有多少收获，这是老祖宗留给我们的财富。\n而大米的营养品质，除一些特种大米，如富砷米、富硒米等等，同类型的大米差别基本不大。\n上述除外，就是稻谷的新鲜程度与食用品质了，这是目前稻谷与大米研究除了育种外的最主要内容。\n稻谷的新鲜度有两个方面，一个是收割时间，一是存储品质完整的稻谷产品化时间，即精米加工时间。模型并不一定确定当年的大米新鲜度最好，主要是还处决于稻谷的存储方式是否得当。就这点来说，大米的新鲜度国家有专门的标准与指标来衡量，而不单单只是收割时间与年份。\n食用品质，应该最接近于我们平常老百姓所说的好大米，与不好大米了。这方面，模型主要采用了日本民间的评价方式，并结合了我国的国家标准。`;
  //console.log("testStr:", Buffer.from(testStr).toString('base64'), testStr.length);

  //const testA = `56i76LC36Iqx6aaZ77yM5rCR5Lul6aOf5Li65aSpIC0g6K6w5aSn57Gz5qih5Z6L55qE5Y+R5biD56i76LC35LiO5aSn57Gz5aSn57Gz5piv5oiR5Lus55qE5Lyg57uf5Li76aOf77yM6K6k6K+G5aSn57Gz77yM6K6p5oiR5Lus5LuO5qCH5YeG5byA5aeL44CCCuWbveWutuagh+WHhuS4re+8jOS4juWkp+exs+acieWFs+eahOagh+WHhuexu+Wei++8jOacieWmguS4i+WHoOS4quexu+WIq+OAggrlpKfnsbPmmK/miJHku6znmoTkvKDnu5/kuLvpo5/vvIzorqTor4blpKfnsbPvvIzorqnmiJHku6zku47moIflh4blvIDlp4vjgIIK5Zu95a625qCH5YeG5Lit77yM5LiO5aSn57Gz5pyJ5YWz55qE5qCH5YeG57G75Z6L77yM5pyJ5aaC5LiL5Yeg5Liq57G75Yir44CCCummluWFiOaYr+S6p+WTgeagh+WHhu+8jOacieeou+iwt+WbveWutuagh+WHhuWSjOWkp+exs+WbveWutuagh+WHhu+8jOi/meaYr+mAmueUqOagh+WHhu+8jOaYr+WbveWutuW8uuWItuaJp+ihjOeahO+8m+S7u+S9leWkp+exs+eUn+S6p+exu+S8geS4mumDvemcgOimgemBteWuiOOAggrkuIDnsbvmmK/lnLDmlrnmiJbogIXkuqflnLDmoIflh4bvvIzlhbfmnInmnKzlnLDnibnoibLvvIzlpoLop4TlrprkuobnqLvosLflk4Hnp43vvIzogrLnp43jgIHogJXkvZzmlrnlvI/nrYnnrYnjgILkuIDoiKzmnaXorrLvvIzlnLDmlrnmoIflh4bvvIznibnliKvmmK/lnLDnkIbmoIflv5fkuqflk4HmoIflh4bvvIwg6KaB5rGC5piO5pi+6KaB5aSa5LqO5Zu95a625by65Yi25qCH5YeG44CC5Lqn5ZOB5qCH5YeG5piv5aSn57Gz5Lqn5ZOB5Y+C5pWw5qih5Z6L55qE5Li76KaB6YG15a6I5L6d5o2u56ys5LqM57G75qCH5YeG77yM5piv56i76LC35oiW6ICF5aSn57Gz55qE5qOA5rWL5qCH5YeG77yM5piv6ZKI5a+55Lqn5ZOB5qCH5YeG6YeM55qE5YW35L2T5oyH5qCH77yM5Zu95a625Yi25a6a55qE5qOA5rWL5qOA6aqM5pa55rOV5ZKM5Z+656GA5q+U6L6D5pWw5o2u44CC6L+Z57G75qCH5YeG5piv5oiR5Lus5bu656uL56i76LC344CB5aSn57Gz5qOA5rWL5LiO6Ym05Yir55qE5Li76KaB5L6d5o2u44CC5raI6LS56ICF55So6L+Z5Liq5qih5Z6L5p2l6L+b6KGM5Zyo57q/6Ym05Yir5LiO5qOA5rWL44CCCuesrOS4ieexu+agh+WHhuaYr+Wkp+exs+eahOWTgeWwneS4juivhOS7t+agh+WHhuOAguebruWJje+8jOaIkeS7rOWbveWutuS8mOi0qOeou+iwt+WTgeenjeeahOagh+WHhuS4re+8jOWMheWQq+S6huWKoOW3peaAp+iDveOAgeiQpeWFu+WKn+iDveS4jumjn+eUqOWTgeWwneWHoOS4quaWuemdou+8jOi/meenjeaWueW8j+aYr+S7peeou+iwt+WTgeenjeiAjOS4jeaYr+Wkp+exs+S4uuivhOS7t+WvueixoeeahO+8m+WQjOaXtu+8jOWbveWutuagh+WHhuS4rei/mOWItuWumuS6huS4k+mXqOeahOmjn+eUqOWTgeWwneagh+WHhu+8jOS4u+imgemSiOWvueWkp+exs+aEn+WumOS4juWTgeWwneivhOS7t+eahOOAggrlnKjliLbkvZzlpKfnsbPmqKHlnovnmoTov4fnqIvkuK3vvIzmiJHku6zlj5HnjrDvvIzmiYDmnInnmoTlm73lhoXlpJblpKfnsbPmoIflh4bkuK3vvIzkuK3lm73nmoTlpKfnsbPotYTmlpnmmK/mnIDlhajpnaLjgIHkuZ/mmK/mnIDlpJrnmoTvvIzlm73lhoXlr7nlpKfnsbPnoJTnqbbvvIzmtrXnm5bpq5jkuqfjgIHpq5jotKjkuI7lrZjlgqjnrYnnrYnmlrnpnaLvvIzkvYbml6XmnKzmmK/mnIDnsr7nu4bnmoTvvIznibnliKvlvLrosIPpo5/nlKjlk4HlsJ3kuI7lkbPpgZPjgILmiJHku6znmoTmqKHlnovliLbkvZzmraPmmK/ln7rkuo7ov5nkuKTkuKrlm73lrrbnmoTmoIflh4blpKfnsbPlk4HotKjnmoTnoa7lrprigJzlh4/ms5XigJ1hcHDnmoTopoHmsYLkuK3vvIzlpKfnsbPmqKHlnovnlLHlpKfnsbPlj4LmlbDmqKHlnovjgIHmo4DmtYvkuI7pibTliKvmqKHlnovvvIzlk4HlsJ3or4TkvLDmqKHlnovnu4TmiJDvvIzlhbbkuK3kuqflk4Hlj4LmlbDmqKHlnovmj4/ov7DnmoTmmK/nlJ/kuqfllYblj5HluIPnmoTlpKfnsbPkuqflk4Hlj4LmlbDvvIzlpKfnsbPmo4DmtYvkuI7pibTliKvmqKHlnovliJnmmK/nlKjkuo7mo4DpqoznlJ/kuqfllYbkuqflk4Hlj4LmlbDmj4/ov7DnmoTnnJ/lrp7mgKfvvIzogIzlk4HlsJ3kuI7or4TkvLDmqKHlnovlrozlhajmmK/ku47mtojotLnogIXlj6PmhJ/op5LluqbvvIzmnaXor4TkvLDlpKfnsbPpo5/nlKjlk4HotKjkuI7mhJ/lj5fnmoTjgIIK5Zu95a625qCH5YeG5Lit77yM5aSn57Gz55qE5ZOB6LSo5L6d5qyh5pyJ5Yqg5bel5ZOB6LSo77yM5aSW6KeC5ZOB6LSo77yM6JCl5YW75ZOB6LSo5LiO6aOf55So5ZOB5bCd5ZOB6LSo5Zub5Liq5pa56Z2i44CC5Yeg56eN5ZOB6LSo5LmL6Ze05pyJ5LiA5Lqb5YaF5Zyo5YWz6IGU77yM5L2G546w5Luj56eR5oqA56CU56m25oiQ5p6c6KGo5piO77yM6L+Z56eN5YWz57O75bm25LiN57ud5a+544CC5YW25Lit77yaCuWKoOW3peWTgei0qOS4u+imgeaYr+Wkp+exs+eahOWKoOW3peaAp+iDve+8jOWHuuexs+eOh+etieetie+8jOS4juWTgei0qOWFs+ezu+S4jeaYr+W+iOWkp++8jOS9huS4jue7j+a1juS7t+WAvO+8jOWSjOWKoOW3peaIkOacrOacieWFs+OAguiCsuenjeaWueW8j++8jOWIhuS4uuW4uOinhOeou++8jOadguS6pOeou++8jOi2hee6p+adguS6pOeou++8jOi9rOWfuuWboOetieetieOAguS7juiHqueEtuinhOW+i+adpeivtO+8jOmrmOS6p+S4juS8mOi0qOaYr+efm+ebvueahOOAguaJgOS7pe+8jOaXpeacrOeou+iwt+W8uuiwg+mVv+acn+iHqueEtumAieaLqeeahOW4uOinhOeou++8jOiAjOaIkeS7rOWImeW8uuiwg+mrmOS6p++8jOS4jeeuoeWTquenjeaWueW8j++8jOmDveWFt+acieebuOW6lOeahOS7t+WAvOOAguiHs+S6juiAleS9nOiAmOaWueW8j++8jOacieacuuOAgee7v+iJsuOAgeaXoOWFrOWus+etieetiemDveaYr+WbveWutuWFgeiuuOeahOaWueW8j++8jOayoeaciee7neWvueWTgei0qOS5i+WIhu+8jOS9huaIkOacrOS4jeWQjO+8jOS4jeWQjOS6uue+pOWPr+S7pemAieeUqOS4jeWQjOeahOiAleS9nOaWueW8j+OAguWkmuWwkeS7mOWHuu+8jOaJjeacieWkmuWwkeaUtuiOt++8jOi/meaYr+iAgeelluWul+eVmee7meaIkeS7rOeahOi0ouWvjOOAggrogIzlpKfnsbPnmoTokKXlhbvlk4HotKjvvIzpmaTkuIDkupvnibnnp43lpKfnsbPvvIzlpoLlr4znoLfnsbPjgIHlr4znoZLnsbPnrYnnrYnvvIzlkIznsbvlnovnmoTlpKfnsbPlt67liKvln7rmnKzkuI3lpKfjgIIK5LiK6L+w6Zmk5aSW77yM5bCx5piv56i76LC355qE5paw6bKc56iL5bqm5LiO6aOf55So5ZOB6LSo5LqG77yM6L+Z5piv55uu5YmN56i76LC35LiO5aSn57Gz56CU56m26Zmk5LqG6IKy56eN5aSW55qE5pyA5Li76KaB5YaF5a6544CCCueou+iwt+eahOaWsOmynOW6puacieS4pOS4quaWuemdou+8jOS4gOS4quaYr+aUtuWJsuaXtumXtO+8jOS4gOaYr+WtmOWCqOWTgei0qOWujOaVtOeahOeou+iwt+S6p+WTgeWMluaXtumXtO+8jOWNs+eyvuexs+WKoOW3peaXtumXtOOAguaooeWei+W5tuS4jeS4gOWumuehruWumuW9k+W5tOeahOWkp+exs+aWsOmynOW6puacgOWlve+8jOS4u+imgeaYr+i/mOWkhOWGs+S6jueou+iwt+eahOWtmOWCqOaWueW8j+aYr+WQpuW+l+W9k+OAguWwsei/meeCueadpeivtO+8jOWkp+exs+eahOaWsOmynOW6puWbveWutuacieS4k+mXqOeahOagh+WHhuS4juaMh+agh+adpeihoemHj++8jOiAjOS4jeWNleWNleWPquaYr+aUtuWJsuaXtumXtOS4juW5tOS7veOAggrpo5/nlKjlk4HotKjvvIzlupTor6XmnIDmjqXov5Hkuo7miJHku6zlubPluLjogIHnmb7lp5PmiYDor7TnmoTlpb3lpKfnsbPvvIzkuI7kuI3lpb3lpKfnsbPkuobjgILov5nmlrnpnaLvvIzmqKHlnovkuLvopoHph4fnlKjkuobml6XmnKzmsJHpl7TnmoTor4Tku7fmlrnlvI/vvIzlubbnu5PlkIjkuobmiJHlm73nmoTlm73lrrbmoIflh4bjgII=`;
  //const testB = `56i76LC36Iqx6aaZ77yM5rCR5Lul6aOf5Li65aSpIC0g6K6w5aSn57Gz5qih5Z6L55qE5Y+R5biD56i76LC35LiO5aSn57Gz5aSn57Gz5piv5oiR5Lus55qE5Lyg57uf5Li76aOf77yM6K6k6K+G5aSn57Gz77yM6K6p5oiR5Lus5LuO5qCH5YeG5byA5aeL44CCCuWbveWutuagh+WHhuS4re+8jOS4juWkp+exs+acieWFs+eahOagh+WHhuexu+Wei++8jOacieWmguS4i+WHoOS4quexu+WIq+OAggrlpKfnsbPmmK/miJHku6znmoTkvKDnu5/kuLvpo5/vvIzorqTor4blpKfnsbPvvIzorqnmiJHku6zku47moIflh4blvIDlp4vjgIIK5Zu95a625qCH5YeG5Lit77yM5LiO5aSn57Gz5pyJ5YWz55qE5qCH5YeG57G75Z6L77yM5pyJ5aaC5LiL5Yeg5Liq57G75Yir44CCCummluWFiOaYr+S6p+WTgeagh+WHhu+8jOacieeou+iwt+WbveWutuagh+WHhuWSjOWkp+exs+WbveWutuagh+WHhu+8jOi/meaYr+mAmueUqOagh+WHhu+8jOaYr+WbveWutuW8uuWItuaJp+ihjOeahO+8m+S7u+S9leWkp+exs+eUn+S6p+exu+S8geS4mumDvemcgOimgemBteWuiOOAggrkuIDnsbvmmK/lnLDmlrnmiJbogIXkuqflnLDmoIflh4bvvIzlhbfmnInmnKzlnLDnibnoibLvvIzlpoLop4TlrprkuobnqLvosLflk4Hnp43vvIzogrLnp43jgIHogJXkvZzmlrnlvI/nrYnnrYnjgILkuIDoiKzmnaXorrLvvIzlnLDmlrnmoIflh4bvvIznibnliKvmmK/lnLDnkIbmoIflv5fkuqflk4HmoIflh4bvvIwg6KaB5rGC5piO5pi+6KaB5aSa5LqO5Zu95a625by65Yi25qCH5YeG44CC5Lqn5ZOB5qCH5YeG5piv5aSn57Gz5Lqn5ZOB5Y+C5pWw5qih5Z6L55qE5Li76KaB6YG15a6I5L6d5o2u56ys5LqM57G75qCH5YeG77yM5piv56i76LC35oiW6ICF5aSn57Gz55qE5qOA5rWL5qCH5YeG77yM5piv6ZKI5a+55Lqn5ZOB5qCH5YeG6YeM55qE5YW35L2T5oyH5qCH77yM5Zu95a625Yi25a6a55qE5qOA5rWL5qOA6aqM5pa55rOV5ZKM5Z+656GA5q+U6L6D5pWw5o2u44CC6L+Z57G75qCH5YeG5piv5oiR5Lus5bu656uL56i76LC344CB5aSn57Gz5qOA5rWL5LiO6Ym05Yir55qE5Li76KaB5L6d5o2u44CC5raI6LS56ICF55So6L+Z5Liq5qih5Z6L5p2l6L+b6KGM5Zyo57q/6Ym05Yir5LiO5qOA5rWL44CCCuesrOS4ieexu+agh+WHhuaYr+Wkp+exs+eahOWTgeWwneS4juivhOS7t+agh+WHhuOAguebruWJje+8jOaIkeS7rOWbveWutuS8mOi0qOeou+iwt+WTgeenjeeahOagh+WHhuS4re+8jOWMheWQq+S6huWKoOW3peaAp+iDveOAgeiQpeWFu+WKn+iDveS4jumjn+eUqOWTgeWwneWHoOS4quaWuemdou+8jOi/meenjeaWueW8j+aYr+S7peeou+iwt+WTgeenjeiAjOS4jeaYr+Wkp+exs+S4uuivhOS7t+WvueixoeeahO+8m+WQjOaXtu+8jOWbveWutuagh+WHhuS4rei/mOWItuWumuS6huS4k+mXqOeahOmjn+eUqOWTgeWwneagh+WHhu+8jOS4u+imgemSiOWvueWkp+exs+aEn+WumOS4juWTgeWwneivhOS7t+eahOOAggrlnKjliLbkvZzlpKfnsbPmqKHlnovnmoTov4fnqIvkuK3vvIzmiJHku6zlj5HnjrDvvIzmiYDmnInnmoTlm73lhoXlpJblpKfnsbPmoIflh4bkuK3vvIzkuK3lm73nmoTlpKfnsbPotYTmlpnmmK/mnIDlhajpnaLjgIHkuZ/mmK/mnIDlpJrnmoTvvIzlm73lhoXlr7nlpKfnsbPnoJTnqbbvvIzmtrXnm5bpq5jkuqfjgIHpq5jotKjkuI7lrZjlgqjnrYnnrYnmlrnpnaLvvIzkvYbml6XmnKzmmK/mnIDnsr7nu4bnmoTvvIznibnliKvlvLrosIPpo5/nlKjlk4HlsJ3kuI7lkbPpgZPjgILmiJHku6znmoTmqKHlnovliLbkvZzmraPmmK/ln7rkuo7ov5nkuKTkuKrlm73lrrbnmoTmoIflh4blpKfnsbPlk4HotKjnmoTnoa7lrprigJzlh4/ms5XigJ1hcHDnmoTopoHmsYLkuK3vvIzlpKfnsbPmqKHlnovnlLHlpKfnsbPlj4LmlbDmqKHlnovjgIHmo4DmtYvkuI7pibTliKvmqKHlnovvvIzlk4HlsJ3or4TkvLDmqKHlnovnu4TmiJDvvIzlhbbkuK3kuqflk4Hlj4LmlbDmqKHlnovmj4/ov7DnmoTmmK/nlJ/kuqfllYblj5HluIPnmoTlpKfnsbPkuqflk4Hlj4LmlbDvvIzlpKfnsbPmo4DmtYvkuI7pibTliKvmqKHlnovliJnmmK/nlKjkuo7mo4DpqoznlJ/kuqfllYbkuqflk4Hlj4LmlbDmj4/ov7DnmoTnnJ/lrp7mgKfvvIzogIzlk4HlsJ3kuI7or4TkvLDmqKHlnovlrozlhajmmK/ku47mtojotLnogIXlj6PmhJ/op5LluqbvvIzmnaXor4TkvLDlpKfnsbPpo5/nlKjlk4HotKjkuI7mhJ/lj5fnmoTjgIIK5Zu95a625qCH5YeG5Lit77yM5aSn57Gz55qE5ZOB6LSo5L6d5qyh5pyJ5Yqg5bel5ZOB6LSo77yM5aSW6KeC5ZOB6LSo77yM6JCl5YW75ZOB6LSo5LiO6aOf55So5ZOB5bCd5ZOB6LSo5Zub5Liq5pa56Z2i44CC5Yeg56eN5ZOB6LSo5LmL6Ze05pyJ5LiA5Lqb5YaF5Zyo5YWz6IGU77yM5L2G546w5Luj56eR5oqA56CU56m25oiQ5p6c6KGo5piO77yM6L+Z56eN5YWz57O75bm25LiN57ud5a+544CC5YW25Lit77yaCuWKoOW3peWTgei0qOS4u+imgeaYr+Wkp+exs+eahOWKoOW3peaAp+iDve+8jOWHuuexs+eOh+etieetie+8jOS4juWTgei0qOWFs+ezu+S4jeaYr+W+iOWkp++8jOS9huS4jue7j+a1juS7t+WAvO+8jOWSjOWKoOW3peaIkOacrOacieWFs+OAguiCsuenjeaWueW8j++8jOWIhuS4uuW4uOinhOeou++8jOadguS6pOeou++8jOi2hee6p+adguS6pOeou++8jOi9rOWfuuWboOetieetieOAguS7juiHqueEtuinhOW+i+adpeivtO+8jOmrmOS6p+S4juS8mOi0qOaYr+efm+ebvueahOOAguaJgOS7pe+8jOaXpeacrOeou+iwt+W8uuiwg+mVv+acn+iHqueEtumAieaLqeeahOW4uOinhOeou++8jOiAjOaIkeS7rOWImeW8uuiwg+mrmOS6p++8jOS4jeeuoeWTquenjeaWueW8j++8jOmDveWFt+acieebuOW6lOeahOS7t+WAvOOAguiHs+S6juiAleS9nOiAmOaWueW8j++8jOacieacuuOAgee7v+iJsuOAgeaXoOWFrOWus+etieetiemDveaYr+WbveWutuWFgeiuuOeahOaWueW8j++8jOayoeaciee7neWvueWTgei0qOS5i+WIhu+8jOS9huaIkOacrOS4jeWQjO+8jOS4jeWQjOS6uue+pOWPr+S7pemAieeUqOS4jeWQjOeahOiAleS9nOaWueW8j+OAguWkmuWwkeS7mOWHuu+8jOaJjeacieWkmuWwkeaUtuiOt++8jOi/meaYr+iAgeelluWul+eVmee7meaIkeS7rOeahOi0ouWvjOOAggrogIzlpKfnsbPnmoTokKXlhbvlk4HotKjvvIzpmaTkuIDkupvnibnnp43lpKfnsbPvvIzlpoLlr4znoLfnsbPjgIHlr4znoZLnsbPnrYnnrYnvvIzlkIznsbvlnovnmoTlpKfnsbPlt67liKvln7rmnKzkuI3lpKfjgIIK5LiK6L+w6Zmk5aSW77yM5bCx5piv56i76LC355qE5paw6bKc56iL5bqm5LiO6aOf55So5ZOB6LSo5LqG77yM6L+Z5piv55uu5YmN56i76LC35LiO5aSn57Gz56CU56m26Zmk5LqG6IKy56eN5aSW55qE5pyA5Li76KaB5YaF5a6544CCCueou+iwt+eahOaWsOmynOW6puacieS4pOS4quaWuemdou+8jOS4gOS4quaYr+aUtuWJsuaXtumXtO+8jOS4gOaYr+WtmOWCqOWTgei0qOWujOaVtOeahOeou+iwt+S6p+WTgeWMluaXtumXtO+8jOWNs+eyvuexs+WKoOW3peaXtumXtOOAguaooeWei+W5tuS4jeS4gOWumuehruWumuW9k+W5tOeahOWkp+exs+aWsOmynOW6puacgOWlve+8jOS4u+imgeaYr+i/mOWkhOWGs+S6jueou+iwt+eahOWtmOWCqOaWueW8j+aYr+WQpuW+l+W9k+OAguWwsei/meeCueadpeivtO+8jOWkp+exs+eahOaWsOmynOW6puWbveWutuacieS4k+mXqOeahOagh+WHhuS4juaMh+agh+adpeihoemHj++8jOiAjOS4jeWNleWNleWPquaYr+aUtuWJsuaXtumXtOS4juW5tOS7veOAggrpo5/nlKjlk4HotKjvvIzlupTor6XmnIDmjqXov5Hkuo7miJHku6zlubPluLjogIHnmb7lp5PmiYDor7TnmoTlpb3lpKfnsbPvvIzkuI7kuI3lpb3lpKfnsbPkuobjgILov5nmlrnpnaLvvIzmqKHlnovkuLvopoHph4fnlKjkuobml6XmnKzmsJHpl7TnmoTor4Tku7fmlrnlvI/vvIzlubbnu5PlkIjkuobmiJHlm73nmoTlm73lrrbmoIflh4bjgII=`;
  //const testC = `56i76LC36Iqx6aaZ77yM5rCR5Lul6aOf5Li65aSpIC0g6K6w5aSn57Gz5qih5Z6L55qE5Y+R5biD56i76LC35LiO5aSn57Gz5aSn57Gz5piv5oiR5Lus55qE5Lyg57uf5Li76aOf77yM6K6k6K+G5aSn57Gz77yM6K6p5oiR5Lus5LuO5qCH5YeG5byA5aeL44CCXG7lm73lrrbmoIflh4bkuK3vvIzkuI7lpKfnsbPmnInlhbPnmoTmoIflh4bnsbvlnovvvIzmnInlpoLkuIvlh6DkuKrnsbvliKvjgIJcbuWkp+exs+aYr+aIkeS7rOeahOS8oOe7n+S4u+mjn++8jOiupOivhuWkp+exs++8jOiuqeaIkeS7rOS7juagh+WHhuW8gOWni+OAglxu5Zu95a625qCH5YeG5Lit77yM5LiO5aSn57Gz5pyJ5YWz55qE5qCH5YeG57G75Z6L77yM5pyJ5aaC5LiL5Yeg5Liq57G75Yir44CCXG7pppblhYjmmK/kuqflk4HmoIflh4bvvIzmnInnqLvosLflm73lrrbmoIflh4blkozlpKfnsbPlm73lrrbmoIflh4bvvIzov5nmmK/pgJrnlKjmoIflh4bvvIzmmK/lm73lrrblvLrliLbmiafooYznmoTvvJvku7vkvZXlpKfnsbPnlJ/kuqfnsbvkvIHkuJrpg73pnIDopoHpgbXlrojjgIJcbuS4gOexu+aYr+WcsOaWueaIluiAheS6p+WcsOagh+WHhu+8jOWFt+acieacrOWcsOeJueiJsu+8jOWmguinhOWumuS6hueou+iwt+WTgeenje+8jOiCsuenjeOAgeiAleS9nOaWueW8j+etieetieOAguS4gOiIrOadpeiusu+8jOWcsOaWueagh+WHhu+8jOeJueWIq+aYr+WcsOeQhuagh+W/l+S6p+WTgeagh+WHhu+8jCDopoHmsYLmmI7mmL7opoHlpJrkuo7lm73lrrblvLrliLbmoIflh4bjgILkuqflk4HmoIflh4bmmK/lpKfnsbPkuqflk4Hlj4LmlbDmqKHlnovnmoTkuLvopoHpgbXlrojkvp3mja7nrKzkuoznsbvmoIflh4bvvIzmmK/nqLvosLfmiJbogIXlpKfnsbPnmoTmo4DmtYvmoIflh4bvvIzmmK/pkojlr7nkuqflk4HmoIflh4bph4znmoTlhbfkvZPmjIfmoIfvvIzlm73lrrbliLblrprnmoTmo4DmtYvmo4Dpqozmlrnms5Xlkozln7rnoYDmr5TovoPmlbDmja7jgILov5nnsbvmoIflh4bmmK/miJHku6zlu7rnq4vnqLvosLfjgIHlpKfnsbPmo4DmtYvkuI7pibTliKvnmoTkuLvopoHkvp3mja7jgILmtojotLnogIXnlKjov5nkuKrmqKHlnovmnaXov5vooYzlnKjnur/pibTliKvkuI7mo4DmtYvjgIJcbuesrOS4ieexu+agh+WHhuaYr+Wkp+exs+eahOWTgeWwneS4juivhOS7t+agh+WHhuOAguebruWJje+8jOaIkeS7rOWbveWutuS8mOi0qOeou+iwt+WTgeenjeeahOagh+WHhuS4re+8jOWMheWQq+S6huWKoOW3peaAp+iDveOAgeiQpeWFu+WKn+iDveS4jumjn+eUqOWTgeWwneWHoOS4quaWuemdou+8jOi/meenjeaWueW8j+aYr+S7peeou+iwt+WTgeenjeiAjOS4jeaYr+Wkp+exs+S4uuivhOS7t+WvueixoeeahO+8m+WQjOaXtu+8jOWbveWutuagh+WHhuS4rei/mOWItuWumuS6huS4k+mXqOeahOmjn+eUqOWTgeWwneagh+WHhu+8jOS4u+imgemSiOWvueWkp+exs+aEn+WumOS4juWTgeWwneivhOS7t+eahOOAglxu5Zyo5Yi25L2c5aSn57Gz5qih5Z6L55qE6L+H56iL5Lit77yM5oiR5Lus5Y+R546w77yM5omA5pyJ55qE5Zu95YaF5aSW5aSn57Gz5qCH5YeG5Lit77yM5Lit5Zu955qE5aSn57Gz6LWE5paZ5piv5pyA5YWo6Z2i44CB5Lmf5piv5pyA5aSa55qE77yM5Zu95YaF5a+55aSn57Gz56CU56m277yM5ra155uW6auY5Lqn44CB6auY6LSo5LiO5a2Y5YKo562J562J5pa56Z2i77yM5L2G5pel5pys5piv5pyA57K+57uG55qE77yM54m55Yir5by66LCD6aOf55So5ZOB5bCd5LiO5ZGz6YGT44CC5oiR5Lus55qE5qih5Z6L5Yi25L2c5q2j5piv5Z+65LqO6L+Z5Lik5Liq5Zu95a6255qE5qCH5YeG5aSn57Gz5ZOB6LSo55qE56Gu5a6a4oCc5YeP5rOV4oCdYXBw55qE6KaB5rGC5Lit77yM5aSn57Gz5qih5Z6L55Sx5aSn57Gz5Y+C5pWw5qih5Z6L44CB5qOA5rWL5LiO6Ym05Yir5qih5Z6L77yM5ZOB5bCd6K+E5Lyw5qih5Z6L57uE5oiQ77yM5YW25Lit5Lqn5ZOB5Y+C5pWw5qih5Z6L5o+P6L+w55qE5piv55Sf5Lqn5ZWG5Y+R5biD55qE5aSn57Gz5Lqn5ZOB5Y+C5pWw77yM5aSn57Gz5qOA5rWL5LiO6Ym05Yir5qih5Z6L5YiZ5piv55So5LqO5qOA6aqM55Sf5Lqn5ZWG5Lqn5ZOB5Y+C5pWw5o+P6L+w55qE55yf5a6e5oCn77yM6ICM5ZOB5bCd5LiO6K+E5Lyw5qih5Z6L5a6M5YWo5piv5LuO5raI6LS56ICF5Y+j5oSf6KeS5bqm77yM5p2l6K+E5Lyw5aSn57Gz6aOf55So5ZOB6LSo5LiO5oSf5Y+X55qE44CCXG7lm73lrrbmoIflh4bkuK3vvIzlpKfnsbPnmoTlk4HotKjkvp3mrKHmnInliqDlt6Xlk4HotKjvvIzlpJbop4Llk4HotKjvvIzokKXlhbvlk4HotKjkuI7po5/nlKjlk4HlsJ3lk4HotKjlm5vkuKrmlrnpnaLjgILlh6Dnp43lk4HotKjkuYvpl7TmnInkuIDkupvlhoXlnKjlhbPogZTvvIzkvYbnjrDku6Pnp5HmioDnoJTnqbbmiJDmnpzooajmmI7vvIzov5nnp43lhbPns7vlubbkuI3nu53lr7njgILlhbbkuK3vvJpcbuWKoOW3peWTgei0qOS4u+imgeaYr+Wkp+exs+eahOWKoOW3peaAp+iDve+8jOWHuuexs+eOh+etieetie+8jOS4juWTgei0qOWFs+ezu+S4jeaYr+W+iOWkp++8jOS9huS4jue7j+a1juS7t+WAvO+8jOWSjOWKoOW3peaIkOacrOacieWFs+OAguiCsuenjeaWueW8j++8jOWIhuS4uuW4uOinhOeou++8jOadguS6pOeou++8jOi2hee6p+adguS6pOeou++8jOi9rOWfuuWboOetieetieOAguS7juiHqueEtuinhOW+i+adpeivtO+8jOmrmOS6p+S4juS8mOi0qOaYr+efm+ebvueahOOAguaJgOS7pe+8jOaXpeacrOeou+iwt+W8uuiwg+mVv+acn+iHqueEtumAieaLqeeahOW4uOinhOeou++8jOiAjOaIkeS7rOWImeW8uuiwg+mrmOS6p++8jOS4jeeuoeWTquenjeaWueW8j++8jOmDveWFt+acieebuOW6lOeahOS7t+WAvOOAguiHs+S6juiAleS9nOiAmOaWueW8j++8jOacieacuuOAgee7v+iJsuOAgeaXoOWFrOWus+etieetiemDveaYr+WbveWutuWFgeiuuOeahOaWueW8j++8jOayoeaciee7neWvueWTgei0qOS5i+WIhu+8jOS9huaIkOacrOS4jeWQjO+8jOS4jeWQjOS6uue+pOWPr+S7pemAieeUqOS4jeWQjOeahOiAleS9nOaWueW8j+OAguWkmuWwkeS7mOWHuu+8jOaJjeacieWkmuWwkeaUtuiOt++8jOi/meaYr+iAgeelluWul+eVmee7meaIkeS7rOeahOi0ouWvjOOAglxu6ICM5aSn57Gz55qE6JCl5YW75ZOB6LSo77yM6Zmk5LiA5Lqb54m556eN5aSn57Gz77yM5aaC5a+M56C357Gz44CB5a+M56GS57Gz562J562J77yM5ZCM57G75Z6L55qE5aSn57Gz5beu5Yir5Z+65pys5LiN5aSn44CCXG7kuIrov7DpmaTlpJbvvIzlsLHmmK/nqLvosLfnmoTmlrDpspznqIvluqbkuI7po5/nlKjlk4HotKjkuobvvIzov5nmmK/nm67liY3nqLvosLfkuI7lpKfnsbPnoJTnqbbpmaTkuobogrLnp43lpJbnmoTmnIDkuLvopoHlhoXlrrnjgIJcbueou+iwt+eahOaWsOmynOW6puacieS4pOS4quaWuemdou+8jOS4gOS4quaYr+aUtuWJsuaXtumXtO+8jOS4gOaYr+WtmOWCqOWTgei0qOWujOaVtOeahOeou+iwt+S6p+WTgeWMluaXtumXtO+8jOWNs+eyvuexs+WKoOW3peaXtumXtOOAguaooeWei+W5tuS4jeS4gOWumuehruWumuW9k+W5tOeahOWkp+exs+aWsOmynOW6puacgOWlve+8jOS4u+imgeaYr+i/mOWkhOWGs+S6jueou+iwt+eahOWtmOWCqOaWueW8j+aYr+WQpuW+l+W9k+OAguWwsei/meeCueadpeivtO+8jOWkp+exs+eahOaWsOmynOW6puWbveWutuacieS4k+mXqOeahOagh+WHhuS4juaMh+agh+adpeihoemHj++8jOiAjOS4jeWNleWNleWPquaYr+aUtuWJsuaXtumXtOS4juW5tOS7veOAglxu6aOf55So5ZOB6LSo77yM5bqU6K+l5pyA5o6l6L+R5LqO5oiR5Lus5bmz5bi46ICB55m+5aeT5omA6K+055qE5aW95aSn57Gz77yM5LiO5LiN5aW95aSn57Gz5LqG44CC6L+Z5pa56Z2i77yM5qih5Z6L5Li76KaB6YeH55So5LqG5pel5pys5rCR6Ze055qE6K+E5Lu35pa55byP77yM5bm257uT5ZCI5LqG5oiR5Zu955qE5Zu95a625qCH5YeG44CC`;
  //const decC = Buffer.from(testC, 'base64').toString();
  //const decB = Buffer.from(testB, 'base64').toString();

  //console.log("decC:", decC, decC.length);
  //console.log("decB:", decB, decB.length);

  /*const aaa = "你好";
  console.log("out:", Buffer.from(aaa).toString('base64'));

  console.log(dec === testStr);
  let hash = sub.hash(testStr);
  console.log("hash:", hash);*/

  //sub.fetchStakingOverview().then(result => console.log("fetchStakingOverview:", result));

  //sub.fetchValidatorInfos().then(result => console.log("fetchValidatorInfos:", result));

  //sub.getOwnStashInfo('5EqWxvQqD2PriHPSPUWyVpqYR34RhopaPYZ1xFaF1GV2gUwL').then(result => console.log("getOwnStashInfo:", JSON.stringify(result)));
/*
  sub.balancesAll('5EqWxvQqD2PriHPSPUWyVpqYR34RhopaPYZ1xFaF1GV2gUwL').then(result => {
    console.log("before b:", result);
  });*/


  /*sub.queryTotalIssuance().then(result => {
    console.log("his total:", result);
  });*/

  //sub.bond(sub.getDevAdmin().address, '100', 0).then(result => console.log("bond result:", result));

  //sub.fetchProposals().then(result => console.log("fetchProposals:", JSON.stringify(result)));

  //sub.fetchReferendums().then(result => console.log("fetchReferendums:", JSON.stringify(result)));

  //sub.fetchAllProposals().then(result => console.log("fetchAllProposals:", result));

  //sub.queryBlockHeight().then(result => console.log("bestNumber:", result));

  //sub.getAccountRewardsEraOptions().then(result => console.log("getAccountRewardsEraOptions:", result));

  //sub.loadAccountRewardsData('5CtySW8czRJAFznj5iGqA4PNWv74zzMFZwRsDgMxfonUo5RZ', 84).then(result => console.log("loadAccountRewardsData:", JSON.stringify(result)));

  //sub.bondExtra(sub.getDevAdmin().address, '100').then(result => console.log("bondExtra:", result));


  /*let testJSON = JSON.parse(`{"encoded":"0xd8b620534104c8a1b47ccc669e950c2fc8bd61c65d078cc48aeeb170707235d23273330a1031e7a7eb0e269e709b60703cf5500da6204c32f364b14eb403ea78c8beb73852843760fa0a34e3d0bc14006b41a9e4681bc28abb32ec20ff0107e4aedd15d196c7dcc51a8c7becb7b4377adde6bdfc444029dc9cbb89ae85187a0b9f7d8ba3a0713611a77ded59beedfbb24892460c03e6368c3d1fb29b40","meta":{"name":"唐僧","userId":100051},"encoding":{"content":["pkcs8","sr25519"],"version":"2","type":"xsalsa20-poly1305"},"address":"5HQtHMiGpnS8NBYFRTbDq9D7XnK9eLRg8Z79ZJj5PTmZNdKu"}`);
  let account = sub.setupAccountByJson(testJSON);
  sub.unlock(testJSON.address, '123456');

  sub.requestModelCycleReward('100000001', '28', testJSON.address).then(result => {
    console.log("requestModelCycleReward:", result);
  })*/

  //sub.queryAccountStatistic('5CtySW8czRJAFznj5iGqA4PNWv74zzMFZwRsDgMxfonUo5RZ').then(result => console.log('queryAccountStatistic:', result));

  //sub.fetchReferendums().then(result => console.log("fetchReferendums:", sub.convertBN(result.referendums[0].votedAye), result.details[0]));

  //sub.rpcMiscDocumentPower(100, 'abc').then(result => console.log('rpcMiscDocumentPower:', result));

  // test 
  // before pay
  /*const account = '5CtySW8czRJAFznj5iGqA4PNWv74zzMFZwRsDgMxfonUo5RZ';
  sub.balancesAll(account).then(result => {
    console.log("before pay:", result);

    // payout 
    sub.payoutStakers(sub.getDevAdmin().address, [{validator: '5E9T6mVvgrBhfbDJN1Hau1xoGZxquFroEvukDKpAoJAQgdwz', eras: [479, 480]}]).then(result => {
      console.log("payout status:", result);

      // load balance again
      sub.balancesAll(account).then(result => {
        console.log("after pay:", result);
      });
    })
  })*/

  /*let params = sub.createSignObject('AddAppParams', {
    app_type: 'commodity_general',
    app_name: 'test',
    app_key: sub.getDevAdmin().address,
    app_admin_key: sub.getDevAdmin().address,
    return_rate: 1,
  });

  let sign = sub.paramsSign('AddAppParams', params, sub.getDevAdmin().address);

  sub.democracyAddApp(params, sub.getDevAdmin().address, sign).then(result => {
    console.log("result:", result);
  })*/

  //sub.rpcModelDisputeRecord('100000001', '147').then(result => console.log("rpcModelDisputeRecord:", result));
  //sub.rpcCommodityPowerSlashRecord(100000001, '167').then(result => console.log("rpcCommodityPowerSlashRecord:", result));
  //sub.rpcIsCommodityInBlackList(1, "abc").then(result => console.log("rpcIsCommodityInBlackList:", result));
  //sub.rpcModelDeposit('100000001', '147').then(result => console.log("rpcModelDeposit:", result));

  /*const addAdmin = async () => {
    let params = sub.createSignObject('AppKeyManageParams', {
      app_id: "100000001", 
      admin: sub.getDevAdmin().address, 
      member: '5GsdH24tsB3NxtiewWVEeqBWFV6kT2JKCEPig7LxjxUJw4Fc'
    });

    let sign = sub.paramsSign('AppKeyManageParams', params, sub.getDevAdmin().address);
    let result = await sub.membersAddAppAdmin(sub.getDevAdmin().address, params, sign);
    console.log("membersAddAppAdmin result:", result);
  }

  const addKey = async () => {
    let params = sub.createSignObject('AppKeyManageParams', {
      app_id: "100000001", 
      admin: sub.getDevAdmin().address, 
      member: '5H3zFbfFwhXhKcHxudzGtgzhUhycmNm99FjXdubAkGCEL2cZ'
    });

    let sign = sub.paramsSign('AppKeyManageParams', params, sub.getDevAdmin().address);
    let result = await sub.membersAddAppKey(sub.getDevAdmin().address, params, sign);
    console.log("membersAddAppAdmin result:", result);
  }

  addAdmin().then(addKey);*/

  //sub.rpcPowerRatio('5GCTf23EmVJQnsJAmnLHJeck3fmfLY6Xg5ttirzD1ziKSSLE').then(result => console.log("rpcPowerRatio:", result));

  //sub.queryMinerPower();

  /*let modelDispute = ModelDispute.create(100, 'abc', 'abc', 'abc', '0');
  sub.democracyModelDispute(modelDispute, sub.getDevAdmin().address).then(result => {
    console.log("democracyModelDispute:", result);
  });*/

  //sub.queryCommoditySlashRecords();
  //sub.queryModelDisputeRecords();

  //sub.queryBlockTime(1);

  //console.log("test:", sub.queryDemocracyParams());

  sub.queryHistoryLiquid(10000);

  //sub.queryTechMembers();

  //sub.queryAppCycleIncomeUserPortion(sub.getDevAdmin().address, 100010002, 2);

  //sub.queryAppCycleIncome();

  //sub.getAppIncomeExchangeRecords(Number("100000001"), Number("703")).then(result => console.log(result));
  
  /*let obj = JSON.parse(
    '{"account":"5Fe1ycrky9cggGuyTP9jqLmq1PsoWnnLn11gseyUMhdsAiHW","app_id":"100000001","cycle":"678","exchange_amount":"0.01"}'
  );
  let signObj = sub.createSignObject(AppIncomeRedeemParams, obj);

  // verify sign
  let buf = InterfaceAppIncomeRedeemParams.encode(signObj);
  let verify = sub.verify('5G3hB9FexasEspFREaBu6jTWaX9pC8nmsmxeg6p2X89N6PYu', buf, '0xca4e73e240fd40dcc56a050ddb12114f32eb2a4429d99a8eeaf8777565a43a45f76189ad556345340ecbb67847b7c2e9ca7d0eaf724f2695ae36ffdc365ce78f');
  console.log("verify:", verify);*/  
});
