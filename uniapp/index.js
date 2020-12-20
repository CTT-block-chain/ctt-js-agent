const Sub = require('../lib/sub');
const Comment = require('../interface/comment');
const AddApp = require('../interface/addApp');
const PowerComplain = require('../interface/powerComplain');
const ModelDispute = require('../interface/modelDispute');

window.subInitKeyring = () => Sub.initKeyring();
window.subInitApi = (node) => Sub.initApi(node);
window.subNewAccount = (name, pwd) => Sub.newAccount(name, pwd);
window.subResetAccountWithMnemonic = (name, mnemonic, password) =>
  Sub.resetAccountWithMnemonic(name, mnemonic, password);
window.subSetupAccountByJson = (json) => Sub.setupAccountByJson(json);
window.subUnlock = (address, pwd) => Sub.unlock(address, pwd);
window.subLock = (address) => Sub.lock(address);
window.subSign = (address, msg) => Sub.sign(address, msg);
window.subVerify = (address, msg, sign) => (Sub.verify(address, msg, sign).isValid ? true : false);
window.subHash = (msg) => Sub.hash(msg);

// comment interface
/**
 *
 * @param {*} app_id
 * @param {*} document_id
 * @param {*} comment_id
 * @param {*} comment_hash
 * @param {*} comment_fee // 点评费用（元）String: "0.00"
 * @param {*} comment_trend // 点评趋势 String：正点评"0" 负点评"1"
 * @param {*} owner_pub_key // 点评用户钱包公钥  交易发送方
 * @param {*} owner_sign // 用户签名
 * @param {*} auth_pub_key // APP服务端公钥
 * @param {*} auth_sign // APP服务端签名
 */
window.subComment = (
  app_id,
  document_id,
  comment_id,
  comment_hash,
  comment_fee,
  comment_trend,
  owner_pub_key,
  owner_sign,
  auth_pub_key,
  auth_sign
) => {
  // data conversion
  let comment = Comment.create(app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend);
  return Sub.createComment(comment, owner_pub_key, owner_sign, auth_pub_key, auth_sign);
};

// generate comment sign
window.subCommentSign = (
  appId,
  documentId,
  commentId,
  commentHash,
  commentFee,
  commentTrend,
  signer_addr,
) => {
  return Sub.paramsSign('CommentData', {
    appId, 
    documentId, 
    commentId, 
    commentHash, 
    commentFee, 
    commentTrend
  }, signer_addr);
};

/**
 * 应用许可参数签名
 * @param {*} appName 应用名称 String
 * @param {*} appType 应用类型 （通过queryAppTypes 获取可用类型）String
 * @param {*} identityKey 应用身份公钥 String
 * @param {*} adminKey 应用管理公钥 String
 * @param {*} returnRate 返点比例 '0' - '9999'  万分比 例如 ‘100’ 为 100/10000 即 1% String
 * @param {*} signer_addr 签名公钥 String
 */
window.subAddAppParamsSign = (
  appType,
  appName,
  appKey,
  appAdminKey,
  return_rate,
  signer_addr
) => {
  return Sub.paramsSign('AddAppParams', {
    appType,
    appName,
    appKey,
    appAdminKey,
    return_rate,
  }, signer_addr);
};

/**
 * 增加模型专家组成员
 * @param {*} app_id
 * @param {*} modle_id
 * @param {*} model_creator 模型创建者公钥
 * @param {*} model_creator_sign 模型创建者签名（签名内容为new_member_pub_key + kpt_profit_rate）
 * @param {*} new_member_pub_key 新增成员公钥
 * @param {*} kpt_profit_rate 每年模型增发kpt分成比例 浮点字符串小数点后至多4位 ("0.0000" - "1")
 */
window.membersAddExpert = (app_id, modle_id, model_creator, model_creator_sign, new_member_pub_key, kpt_profit_rate) =>
  Sub.membersAddExpertByCreator(
    app_id,
    modle_id,
    model_creator,
    model_creator_sign,
    new_member_pub_key,
    kpt_profit_rate
  );

/**
 * 应用等值赎回
 * @param {*} app_id 
 * @param {*} cash_receipt 
 * @param {*} sender_pub_key 
 */
window.memberStableRedeem = (app_id, cash_receipt, sender_pub_key) => Sub.membersStabelRedeem(app_id, cash_receipt, sender_pub_key);

window.walletBalanceAll = (address) => Sub.balancesAll(address);
window.walletTransfer = (srcAddress, destAddress, amount, password) =>
  Sub.transfer(srcAddress, destAddress, amount, password);

window.walletFetchCouncilVotes = () => Sub.fetchCouncilVotes();
window.walletFetchReferendums = () => Sub.fetchCouncilVotes();

// query
window.queryTotalPower = () => Sub.rpcGetTotalPower();
window.queryAccountPower = (address) => Sub.rpcGetAccountPower(address);
window.queryCommodityPower = (app_id, cart_ids) => Sub.rpcGetCommodityPower(app_id, cart_ids);
/**
 * 查询指定账户在某次应用融资中的可兑换额度
 * @param {*} address 账户地址 String
 * @param {*} appId 应用ID Number or String
 * @param {*} proposalId 融资提案标识 String
 * 返回值： 本次可兑换额度，只含整数部分 例如 '135'
 */
window.queryAppFinancedPortion = (address, appId, proposalId) => Sub.queryAppFinancedUserPortion(address, appId, proposalId);

// const api
window.constBalanceExistentialDeposit = () => Sub.constBalanceExistentialDeposit();

// democracy
/**
 * 应用融资
 * @param {*} appId app_id Number String
 * @param {*} kptAmount 融资发行KPT数量 String, 单位KPT
 * @param {*} exchangeRate 1法币可兑换多少KPT String
 * @param {*} sender_pub_key 发送账户公钥 String
 */
window.democracyAppFinanced = (appId, kptAmount, exchangeRate, sender_pub_key, deposit) => {
  return Sub.democracyAppFinanced(appId, kptAmount, exchangeRate, sender_pub_key, deposit);
};

/**
 * 算力投诉
 * @param {*} app_id 应用ID String or Number
 * @param {*} cart_id 购物车ID String
 * @param {*} comment_id 评论ID String
 * @param {*} comment_content 评论内容 String
 * @param {*} sender_pub_key 发送账户公钥
 * @param {*} deposit 抵押金额 Number String
 */
window.democracyPowerComplain = (app_id, cart_id, comment_id, comment_content, sender_pub_key, deposit) => {
  let powerComplain = PowerComplain.create(app_id, comment_id, cart_id, comment_content);
  return Sub.democracyPowerComplain(powerComplain, sender_pub_key, deposit);
};

/**
 * 
 * @param {*} app_id 应用ID String or Number
 * @param {*} comment_id 评论ID String
 * @param {*} modle_id 模型ID String
 * @param {*} comment_content 评论内容 String
 * @param {*} dispute_type 复议级别 Number String（'0': 一般性非故意错误， '1': 一般性故意错误 '2': 严重错误 ）
 * @param {*} sender_pub_key 发送账户公钥
 * @param {*} deposit 抵押金额 Number String
 */
window.democracyModelDispute = (app_id, comment_id, modle_id, comment_content, dispute_type, sender_pub_key, deposit) => {
  let modelDispute = ModelDispute.create(app_id, comment_id, modle_id, comment_content, dispute_type);
  return Sub.democracyModelDispute(modelDispute, sender_pub_key, deposit);
}
