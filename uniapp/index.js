const Sub = require('../lib/sub');
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
 * @param {*} comment_params: {
 *              app_id
 *              document_id
 *              comment_id
 *              comment_hash
 *              comment_fee // 点评费用（元）String: "0.00"
 *              comment_trend // 点评趋势 String：正点评"0" 负点评"1"
 *            }
 * @param {*} owner_pub_key // 点评用户钱包公钥  交易发送方
 * @param {*} owner_sign // 用户签名
 * @param {*} auth_pub_key // APP服务端公钥
 * @param {*} auth_sign // APP服务端签名
 */
window.subComment = (
  comment_params,
  owner_pub_key,
  owner_sign,
  auth_pub_key,
  auth_sign
) => {
  // data conversion
  let comment = Sub.createSignObject('CommentData', comment_params);
  return Sub.createComment(comment, owner_pub_key, owner_sign, auth_pub_key, auth_sign);
};

/**
 * 对象签名
 * @param {*} params_type 参数对象类型 String 具体包括以下：
 * @param {*} params_obj 参数对象值，与接口调用对象一致
 * @param {*} signer_key 签名公钥，需确保已加载
 */
window.signParams = (params_type, params_obj, signer_key) => {
  let sign_obj = Sub.createSignObject(params_type, params_obj);
  if (!sign_obj) {
    console.error("create sign object fail", params_type, params_obj);
    return null;
  }

  return Sub.paramsSign(params_type, sign_obj, signer_key);
}


/**
 * 增加模型专家组成员
 * params: {
 *  app_id
 *  model_id
 *  kpt_profit_rate 每年模型增发kpt分成比例 浮点字符串小数点后至多4位 ("0.0000" - "1")
 * }
 * @param {*} model_creator 模型创建者公钥
 * @param {*} model_creator_sign 模型创建者签名（签名内容为new_member_pub_key + kpt_profit_rate）
 * @param {*} new_member_pub_key 新增成员公钥
 */
window.membersAddExpert = (params, model_creator, model_creator_sign, new_member_pub_key) => {
  let paramsObj = Sub.createSignObject('ModelExpertAddMemberParams', params);
  return Sub.membersAddExpertByCreator(
    paramsObj,
    model_creator,
    model_creator_sign,
    new_member_pub_key   
  );
};

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

/**
 * 查询账户在某次融资中的兑换状态
 * @param {*} appId 
 * @param {*} proposalId 
 * @param {*} account 
 */
window.queryAppFinancedExchangeStatus = (appId, proposalId, account) => Sub.rpcAppFinanceExchangeData(appId, proposalId, account);

// const api
window.constBalanceExistentialDeposit = () => Sub.constBalanceExistentialDeposit();

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

/**
 * 查询融资记录
 * @param {*} app_id 
 * @param {*} proposal_id 
 */
window.queryAppFinanceRecord = (app_id, proposal_id) => Sub.rpcAppFinanceRecord(app_id, proposal_id);


/**
 * 查询用户账户在指定融资中的最大赎回份额
 * @param {*} account 
 * @param {*} app_id 
 * @param {*} proposal_id 
 */
window.queryAppFinancedUserPortion = (account, app_id, proposal_id) => Sub.queryAppFinancedUserPortion(account, app_id, proposal_id);


/**
 * 模型增发奖励当前阶段
 * 返回值：{
 *  stage: '0':周期未结束 '1':模型收入统计中 '2':奖励申领阶段
 *  left_seconds: 该阶段剩余的秒数
 * }
 */
window.queryCurrentModelRewardStage = () => Sub.rpcModelIncomeCurrentStage();

/**
 * 模型增发奖励申领
 * @param {*} app_id 
 * @param {*} model_id 
 * @param {*} user_address 
 */
window.requestModelCycleReward = (app_id, model_id, user_address) => Sub.requestModelCycleReward(app_id, model_id, user_address);

/**
 * 抵押金额加权知识算力
 * @param {*} account 用户账户
 * @param {*} stake 抵押值 String (例如 "100.53", 单位KPT)
 */
window.stakeToVote = (account, stake) => Sub.rpcStakeToVote(account, stake);

/**
 * 抵押
 * @param {*} account 控制账户
 * @param {*} amount 抵押金额，例如 "10.5"
 * @param {*} reward_to 奖励处理方式：0:储值账户，收益自动抵押， 1:储值账户，收益不再抵押， 2:控制账户
 */
window.bond = (account, amount, reward_to) => Sub.bond(account, amount, reward_to);

/**
 * 验证节点信息
 * 返回值：
 * [
    {
      accountId: '5DZLq7gpzHfSpNruFamZKpUVnreNjB7z4E8uSLApJ36xjCWD',
      bondInfo: { total: '502.0889 KPT', own: '502.0889 KPT' },
      commission: '0'
    },
    {
      accountId: '5HdvEEyHXxKHWt15LizRBEWkL8N3BozGwziXa23k5xEGS7xw',
      bondInfo: { total: '502.0854 KPT', own: '502.0854 KPT' },
      commission: '0'
    }
  ]
 */
window.fetchValidatorInfos = () => Sub.fetchValidatorInfos();

/**
 * 获取账户抵押信息
 * @param {*} account 可以是controller账户或者stash账户
 * 返回值：
 * { bond: '502.0854 KPT', unlocking: '0', redeemable: '0' } 
 */
window.getOwnStashInfo = (account) => Sub.getOwnStashInfo(account);

/**
 * 提名验证人，在抵押完成后可执行此操作
 * @param {*} account 
 * @param {*} targets 目标验证人地址数组 ['xxx', 'xxx',...]
 */
window.nominate = (account, targets) => Sub.nominate(account, targets);

/**
 * 读取公投提案
 * @param {*} account 
 */
window.fetchReferendums = (account) => Sub.fetchReferendums(account);


/**
 * 读取提案列表
 */
window.fetchProposals = () => Sub.fetchProposals();


/**
 * 公投投票
 * @param {*} id   公投ID Number
 * @param {*} isYes  是否赞成 bool
 * @param {*} amount 投票金额 例如："1.1"
 */
window.vote = (account, id, isYes, amount) => Sub.vote(account, id, isYes, amount);

/**
 * 转换BN 到 浮点string
 * @param {*} bnNum 
 */
window.convertBN = (bnNum) => Sub.convertBN(bnNum);