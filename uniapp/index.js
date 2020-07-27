const Sub = require("../lib/sub");
const Comment = require("../interface/comment");

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
 * @param {*} sender_addr // APP钱包公钥
 * @param {*} server_addr // APP服务端公钥
 * @param {*} server_sign // APP服务端签名
 */
window.subComment = (
  app_id,
  document_id,
  comment_id,
  comment_hash,
  comment_fee,
  comment_trend,
  sender_addr,
  server_addr,
  server_sign
) => {
  // data conversion
  comment_fee = Math.round(Number(comment_fee) * 100);
  comment_trend = Number(comment_trend);
  let comment = Comment.create(app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend);

  // TODO: sender and owner sign
  return Sub.createComment(comment, server_addr, server_sign, sender_addr, "0x0");
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

window.walletBalanceAll = (address) => Sub.balancesAll(address);
window.walletTransfer = (srcAddress, destAddress, amount, password) =>
  Sub.transfer(srcAddress, destAddress, amount, password);

window.walletFetchCouncilVotes = () => Sub.fetchCouncilVotes();
window.walletFetchReferendums = () => Sub.fetchCouncilVotes();

// query
window.queryTotalPower = () => Sub.rpcGetTotalPower();
window.queryAccountPower = (address) => Sub.rpcGetAccountPower(address);
window.queryCommodityPower = (app_id, cart_id) => Sub.rpcGetCommodityPower(app_id, cart_id);
