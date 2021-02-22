// Required imports
const fs = require('fs');
const { BN } = require('bn.js');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { stringToU8a, u8aToHex, hexToU8a, hexToString, u8aToString, u8aConcat, isFunction, formatBalance, BN_ONE, BN_ZERO } = require('@polkadot/util');
const { blake2AsHex, mnemonicGenerate, cryptoWaitReady, signatureVerify } = require('@polkadot/util-crypto');
const { encode } = require('./codec');
const { convertBalance } = require('./util');
const { GenericCall, getTypeDef } = require("@polkadot/types");
const { approxChanges } = require("./referendumApproxChanges");

const { AppFinancedProposalParams, AppFinancedUserExchangeParams, AppFinancedUserExchangeConfirmParams, CommentData,
  AddAppParams, AuthParamsCreateModel, ClientParamsCreateModel, ClientParamsCreatePublishDoc,
  ClientParamsCreateIdentifyDoc, ClientParamsCreateTryDoc, ClientParamsCreateChooseDoc, 
  ClientParamsCreateModelDoc, ModelExpertAddMemberParams, ModelExpertDelMemberParams, ModelIncomeCollectingParam, 
  AppKeyManageParams, AppIncomeRedeemParams, AppIncomeRedeemConfirmParams, DisableModelParams } = require('./signParamsDefine');

const InterfaceComment = require('../interface/comment');
const InterfaceAppFinancedUserExchangeParams = require('../interface/appFinancedUserExchangeParams');
const InterfaceAppFinancedUserExchangeConfirmParams = require('../interface/appFinancedUserExchangeConfirmParams');
const InterfaceAppFinancedProposalParams = require('../interface/appFinancedProposalParams');
const InterfaceAddAppParams = require('../interface/addAppParams');
const InterfaceAuthParamsCreateModel = require('../interface/authParamsCreateModel');
const InterfaceClientParamsCreateModel = require('../interface/clientParamsCreateModel');
const InterfaceClientParamsCreatePublishDoc = require('../interface/clientParamsCreatePublishDoc');
const InterfaceClientParamsCreateIdentifyDoc = require('../interface/clientParamsCreateIdentifyDoc');
const InterfaceClientParamsCreateTryDoc = require('../interface/clientParamsCreateTryDoc');
const InterfaceClientParamsCreateChooseDoc = require('../interface/clientParamsCreateChooseDoc');
const InterfaceClientParamsCreateModelDoc = require('../interface/clientParamsCreateModelDoc');
const InterfaceModelExpertAddMemberParams = require('../interface/modelExpertAddMemberParams');
const InterfaceModelExpertDelMemberParams = require('../interface/modelExpertDelMemberParams');
const InterfaceModelIncomeCollectingParam = require('../interface/modelIncomeCollectingParam');
const InterfaceAppKeyManageParams = require('../interface/appKeyManage');
const InterfaceAppIncomeRedeemParams = require('../interface/appIncomeRedeemParams');
const InterfaceAppIncomeRedeemConfirmParams = require('../interface/appIncomeRedeemConfirmParams');
const InterfaceDisableModelParams = require('../interface/disableModelParams');

const DEC_NUM = 14;

const isApiReady = () => {
  if (!this.isApiReady) {
    throw new Error('api not ready');
  }
};

const isKeyringReady = () => {
  if (!this.isKeyringReady) {
    throw new Error('keyring not ready');
  }
};

const initKeyring = async (sudo_json, pwd) => {
  await cryptoWaitReady();
  // create keyring
  this.keyring = new Keyring({ type: 'sr25519' });

  if (sudo_json && pwd) {
    this.sudo = this.keyring.addFromJson(sudo_json);
    this.sudo_pwd = pwd;
    this.sudo.decodePkcs8(pwd);
  }

  
  this.isKeyringReady = true;
};

const getDevAdmin = () => this.sudo;

const chainDataTypes = {
  // mapping the actual specified address format
  // Address: "AccountId",
  // mapping the lookup
  // LookupSource: "AccountId",

  PowerSize: 'u64',
  AccountID32: 'AccountId',
  AuthAccountId: 'AccountId',
  
  KPProductPublishData: {
    paraIssueRate: 'PowerSize',
    selfIssueRate: 'PowerSize',
  },

  KPProductIdentifyData: {
    goodsPrice: 'PowerSize',
    identRate: 'PowerSize',
    identConsistence: 'PowerSize',
    cartId: 'Vec<u8>',
  },

  KPProductTryData: {
    goodsPrice: 'PowerSize',
    offsetRate: 'PowerSize',
    trueRate: 'PowerSize',
    cartId: 'Vec<u8>',
  },

  KPProductChooseData: {
    sellCount: 'PowerSize',
    tryCount: 'PowerSize',
  },

  KPModelCreateData: {
    producerCount: 'PowerSize',
    productCount: 'PowerSize',
  },

  LeaderBoardItem: {
    cartId: 'Vec<u8>',
    power: 'PowerSize',
    owner: 'AccountId',
  },

  LeaderBoardItemRPC: {
    cart_id: 'Bytes',
    power: 'PowerSize',
    owner: 'AccountId',
  },

  LeaderBoardResultRPC: {
    accounts: 'Vec<AccountId>',
    board: 'Vec<LeaderBoardItemRPC>',
  },

  ModelStatus: {
    _enum: ['ENABLED', 'DISABLED'],
  },

  DocumentType: {
    _enum: ['ProductPublish', 'ProductIdentify', 'ProductTry', 'ProductChoose', 'ModelCreate', 'Unknown'],
  },

  CommentTrend: {
    _enum: ['Positive', 'Negative', 'Empty'],
  },

  ModelDisputeType: {
    _enum: ['NoneIntendNormal', 'IntendNormal', 'Serious'],
  },

  KPProductPublishData: {
    paraIssueRate: 'PowerSize',
    selfIssueRate: 'PowerSize',
  },

  KPProductIdentifyData: {
    goodsPrice: 'PowerSize',
    identRate: 'PowerSize',
    identConsistence: 'PowerSize',
    cartId: 'Vec<u8>',
  },

  KPProductTryData: {
    goodsPrice: 'PowerSize',
    offsetRate: 'PowerSize',
    trueRate: 'PowerSize',
    cartId: 'Vec<u8>',
  },

  KPProductChooseData: {
    sellCount: 'PowerSize',
    tryCount: 'PowerSize',
  },

  KPModelCreateData: {
    producerCount: 'PowerSize',
    productCount: 'PowerSize',
  },

  DocumentSpecificData: {
    _enum: {
      ProductPublish: 'KPProductPublishData',
      ProductIdentify: 'KPProductIdentifyData',
      ProductTry: 'KPProductTryData',
      ProductChoose: 'KPProductChooseData',
      ModelCreate: 'KPModelCreateData',
    },
  },

  KPDocumentDataOf: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    modelId: 'Vec<u8>',
    productId: 'Vec<u8>',
    contentHash: 'Hash',
    sender: 'AccountId',
    owner: 'AuthAccountId',
    documentType: 'DocumentType',
    documentData: 'DocumentSpecificData',
    commentCount: 'PowerSize',
    commentTotalFee: 'PowerSize',
    commentPositiveCount: 'PowerSize',
    expertTrend: 'CommentTrend',
    platformTrend: 'CommentTrend',
  },

  KPModelDataOf: {
    appId: 'u32',
    modelId: 'Vec<u8>',
    expertId: 'Vec<u8>',
    status: 'ModelStatus',
    commodityName: 'Vec<u8>',
    commodityType: 'u32',
    contentHash: 'Hash',
    sender: 'AccountId',
    owner: 'AuthAccountId',
    createReward: 'BalanceOf'
  },

  KPCommentDataOf: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    commentId: 'Vec<u8>',
    commentHash: 'Hash',
    commentFee: 'PowerSize',
    commentTrend: 'u8',
    sender: 'AccountId',
    owner: 'AuthAccountId',
  },

  DocumentPower: {
    attend: 'PowerSize',
    content: 'PowerSize',
    judge: 'PowerSize',
  },

  QueryCommodityPowerParams: {
    appId: 'u32',
    cartId: 'Bytes',
  },

  QueryPlatformExpertParams: {
    appId: 'u32',
  },

  QueryModelExpertParams: {
    appId: 'u32',
    modelId: 'Bytes',
  },

  CommodityTypeData: {
    typeId: 'u32',
    typeDesc: 'Vec<u8>',
  },

  QueryLeaderBoardParams: {
    appId: 'u32',
    modelId: 'Bytes',
    block: 'u32',
  },

  LeaderBoardResult: {
    accounts: 'Vec<AccountId>',
    board: 'Vec<LeaderBoardItem>',
  },

  CommodityLeaderBoardData: {
    cartId: 'Vec<u8>',
    cartIdHash: 'T::Hash',
    power: 'PowerSize',
    owner: 'AccountId',
  },

  StakeToVoteParams: {
    account: 'AccountId',
    stake: 'u64',
  },

  StakeToVoteResult: {
    result: 'u64',
  },

  AppFinancedProposalParams: {
    account: 'AccountId',
    appId: 'u32',
    proposalId: 'Vec<u8>',
    exchange: 'Balance',
    amount: 'Balance',
  },

  AppFinancedUserExchangeParams: {
    account: 'AccountId',
    appId: 'u32',
    proposalId: 'Vec<u8>',
    exchangeAmount: 'Balance',
  },

  AppFinanceRecordParams: {
    appId: 'u32',
    proposalId: 'Bytes',
  },

  AppFinanceExchangeDataParams: {
    appId: 'u32',
    proposalId: 'Bytes',
    account: 'AccountId'
  },

  AppFinanceExchangeDataRPC: {
    exchangeAmount: 'u64',
    status: 'u8', // 0: initial state, 1: reserved, 2: received cash and burned
    payId: 'Bytes'
  },

  AppFinancedUserExchangeConfirmParams: {
    account: 'AccountId',
    appId: 'u32',
    payId: 'Vec<u8>',
    proposalId: 'Vec<u8>'
  },

  AppFinancedData: {
    amount: 'Balance',
    exchange: 'Balance',
    block: 'BlockNumber',
    totalBalance: 'Balance',
    exchanged: 'Balance',
    exchangeEndBlock: 'BlockNumber'
  },

  AppFinanceDataRPC: {
    amount: 'u64',
    exchange: 'u64',
    block: 'BlockNumber',
    totalBalance: 'u64',
    exchanged: 'u64',
    exchangeEndBlock: 'BlockNumber'
  },

  CommentData: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    commentId: 'Vec<u8>',
    commentHash: 'Hash',
    commentFee: 'PowerSize',
    commentTrend: 'u8',
  },

  AddAppParams: {
    appType: 'Vec<u8>',
    appName: 'Vec<u8>',
    appKey: 'AccountId',
    appAdminKey: 'AccountId',
    returnRate: 'u32',
  },

  ClientParamsCreateModel: {
    appId: 'u32',
    expertId: 'Vec<u8>',
    commodityName: 'Vec<u8>',
    commodityType: 'u32',
    contentHash: 'Hash'
  },

  AuthParamsCreateModel: {
    modelId: 'Vec<u8>'
  },

  ClientParamsCreatePublishDoc: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    modelId: 'Vec<u8>',
    productId: 'Vec<u8>',
    contentHash: 'Hash',
    paraIssueRate: 'PowerSize',
    selfIssueRate: 'PowerSize',
    attendRate: 'PowerSize'
  },

  ClientParamsCreateIdentifyDoc: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    productId: 'Vec<u8>',
    contentHash: 'Hash',
    goodsPrice: 'PowerSize',
    identRate: 'PowerSize',
    identConsistence: 'PowerSize',
    sellerConsistence: 'PowerSize',
    cartId: 'Vec<u8>'
  },

  ClientParamsCreateTryDoc: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    productId: 'Vec<u8>',
    contentHash: 'Hash',
    goodsPrice: 'PowerSize',
    offsetRate: 'PowerSize',
    trueRate: 'PowerSize',
    sellerConsistence: 'PowerSize',
    cartId: 'Vec<u8>'
  },

  ClientParamsCreateChooseDoc: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    modelId: 'Vec<u8>',
    productId: 'Vec<u8>',
    contentHash: 'Hash',
    sellCount: 'PowerSize',
    tryCount: 'PowerSize'
  },

  ClientParamsCreateModelDoc: {
    appId: 'u32',
    documentId: 'Vec<u8>',
    modelId: 'Vec<u8>',
    productId: 'Vec<u8>',
    contentHash: 'Hash',
    producerCount: 'PowerSize',
    productCount: 'PowerSize'
  },

  ModelExpertAddMemberParams: {
    appId: 'u32',
    modelId: 'Vec<u8>',
    kptProfitRate: 'u32'
  },

  ModelExpertDelMemberParams: {
    appId: 'u32',
    modelId: 'Vec<u8>',
    member: 'AccountId'
  },

  AppData: {
    name: 'Vec<u8>',
    returnRate: 'u32',
    stake: 'Balance'
  },

  ModelIncome: {
    modelId: 'Vec<u8>',
    income: 'u64',
  },

  ModelIncomeCollectingParam: {
    appId: 'u32',
    modelIds: 'Vec<Vec<u8>>',
    incomes: 'Vec<u64>',
  },

  ModelIncomeCurrentStageRPC: {
    stage: 'u8',
    left: 'BlockNumber',
  },

  ModelCycleIncomeReward: {
    account: 'AccountId',
    appId: 'u32',
    modelId: 'Vec<u8>',
    reward: 'BalanceOf'
  },

  KPCommentAccountRecord: {
    count: 'PowerSize',
    fees: 'PowerSize',
    positiveCount: 'PowerSize'
  },

  TechMemberSignParams: {
    account: 'AuthAccountId',
    msg: 'Bytes',
    sign: 'Bytes',
  },

  AccountStatistics: {
    createCommodityNum: 'u32',
    slashCommodityNum: 'u32',
    slashKpTotal: 'u64',
    commentNum: 'u32',
    commentCostTotal: 'u64',
    commentCostMax: 'u64',
    commentPositiveTrendNum: 'u32',
    commentNegativeTrendNum: 'u32'
  },

  MiscDocumentPowerParams: {
    appId: 'u32',
    documentId: 'Bytes'
  },

  AppKeyManageParams: {
    admin: 'AuthAccountId',
    appId: 'u32',
    member: 'AccountId'
  },

  AppCommentKeyParams: {
    appId: 'u32',
    commentId: 'Bytes',
  },

  ModelDisputeRecord: {
    appId: 'u32',
    modelId: 'Bytes',
    commentId: 'Bytes',
    disputeType: 'ModelDisputeType',
    block: 'BlockNumber'
  },

  CommoditySlashRecord: {
    appId: 'u32',
    commentId: 'Vec<u8>',
    cartId: 'Vec<u8>',
    block: 'BlockNumber'
  },

  QueryModelParams: {
    appId: 'u32',
    modelId: 'Bytes'
  },

  AppIncomeRedeemParams: {
    account: 'AccountId',
    appId: 'u32',
    cycle: 'BlockNumber',
    exchangeAmount: 'BalanceOf'
  },

  AppIncomeRedeemConfirmParams: {
    account: 'AccountId',
    appId: 'u32',
    payId: 'Vec<u8>',
    cycle: 'BlockNumber'
  },

  AppIncomeCycleRecord: {
    initial: 'BalanceOf',
    balance: 'BalanceOf',
    cycle: 'BlockNumber',
    appId: 'u32',
    income: 'u64'
  },

  DisableModelParams: {
    app_id: 'u32',
    model_id: 'Vec<u8>'
  }

};

const rpc = {
  kp: {
    totalPower: {
      description: 'Get current total knowledge power.',
      params: [],
      type: 'PowerSize',
    },

    accountPower: {
      description: 'Get account knowledge power.',
      params: [
        {
          name: 'account',
          type: 'AccountId',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'PowerSize',
    },

    powerRatio: {
      description: 'Get account knowledge power ratio.',
      params: [
        {
          name: 'account',
          type: 'AccountId',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'u64',
    },

    commodityPower: {
      description: 'Get commodify knowledge power.',
      params: [
        {
          name: 'query',
          type: 'QueryCommodityPowerParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'PowerSize',
    },

    miscDocumentPower: {
      description: 'Get choose and model create knowledge power.',
      params: [
        {
          name: 'query',
          type: 'MiscDocumentPowerParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'PowerSize',
    },

    isCommodityPowerExist: {
      description: 'Check if commodify knowledge power exist.',
      params: [
        {
          name: 'query',
          type: 'QueryCommodityPowerParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'bool',
    },

    isCommodityInBlackList: {
      description: 'Check if commodify knowledge power in black list.',
      params: [
        {
          name: 'query',
          type: 'QueryCommodityPowerParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'bool',
    },

    leaderBoardResult: {
      description: 'read power leader board result.',
      params: [
        {
          name: 'query',
          type: 'QueryLeaderBoardParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'LeaderBoardResult',
    },

    stakeToVote: {
      description: 'convert balance to vote weight according accuont kp.',
      params: [
        {
          name: 'params',
          type: 'StakeToVoteParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'StakeToVoteResult',
    },

    appFinanceRecord: {
      description: 'get app finance record.',
      params: [
        {
          name: 'params',
          type: 'AppFinanceRecordParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'AppFinanceDataRPC',
    },

    appFinanceExchangeAccounts: {
      description: 'get app finance exchange record accounts.',
      params: [
        {
          name: 'params',
          type: 'AppFinanceRecordParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'Vec<AccountId>',
    },

    appFinanceExchangeData: {
      description: 'get app finance exchange data.',
      params: [
        {
          name: 'params',
          type: 'AppFinanceExchangeDataParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'AppFinanceExchangeDataRPC',
    },

    modelIncomeCurrentStage: {
      description: 'get current model income/reward stage.',
      params: [
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'ModelIncomeCurrentStageRPC',
    },

    isTechMemberSign: {
      description: 'check if a signature is signed by tech member',
      params: [
        {
          name: 'params',
          type: 'TechMemberSignParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'bool',
    },

    modelDepositRecord: {
      description: 'load model dispute record',
      params: [
        {
          name: 'params',
          type: 'AppCommentKeyParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'ModelDisputeRecord',
    },

    commodityPowerSlashRecord: {
      description: 'load commodity power slash record',
      params: [
        {
          name: 'params',
          type: 'AppCommentKeyParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'CommoditySlashRecord',
    },

    modelDeposit: {
      description: 'get model deposit.',
      params: [
        {
          name: 'params',
          type: 'QueryModelParams'
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true
        }
      ],
      type: 'u64'
    }
  },
  members: {
    isPlatformExpert: {
      description: 'check if account be platform expert',
      params: [
        {
          name: 'account',
          type: 'AccountId',
        },
        {
          name: 'query',
          type: 'QueryPlatformExpertParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'bool',
    },
    isModelExpert: {
      description: 'check if account be model expert',
      params: [
        {
          name: 'account',
          type: 'AccountId',
        },
        {
          name: 'query',
          type: 'QueryModelExpertParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'bool',
    },
    isModelCreator: {
      description: 'check if account be model creator',
      params: [
        {
          name: 'account',
          type: 'AccountId',
        },
        {
          name: 'query',
          type: 'QueryModelExpertParams',
        },
        {
          name: 'at',
          type: 'Hash',
          isOptional: true,
        },
      ],
      type: 'bool',
    },
  },
};

const initApi = async (wss, notify_cb) => {
  console.log('sub is trying to connect to node');
  this.notify_cb = notify_cb;

  // create api
  this.api = await ApiPromise.create({ provider: new WsProvider(wss), types: chainDataTypes, rpc });

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    this.api.rpc.system.chain(),
    this.api.rpc.system.name(),
    this.api.rpc.system.version(),
  ]);

  const chainInfo = `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`;

  console.log(chainInfo);

  this.isApiReady = true;
  // return chain info
  return chainInfo;
};

const newAccount = (name, password) => {
  isKeyringReady();
  const mnemonic = mnemonicGenerate(12);
  let path = `${mnemonic}//hard/derivatio`;
  if (!!password) {
    path += `///${password}`;
  }

  const pair = this.keyring.addFromUri(path, {
    name,
  });

  const json = pair.toJson(password);
  pair.lock();
  // try add to keyring again to avoid no encrypted data bug
  this.keyring.addFromJson(json);

  return { mnemonic, json };
};

const resetAccountWithMnemonic = (name, mnemonic, password) => {
  isKeyringReady();
  let path = `${mnemonic}//hard/derivatio`;
  if (!!password) {
    path += `///${password}`;
  }

  const pair = this.keyring.addFromUri(path, {
    name,
  });

  return { mnemonic, json: pair.toJson(password) };
};

const setupAccountByJson = (json) => {
  isKeyringReady();
  try {
    this.keyring.getPair(json.address);
  } catch (e) {
    // address not setup, use json
    console.log(`${json.address} not ready, reload it`);
    this.keyring.addFromJson(json);
  }
};

const isAccountActive = (address) => {
  isKeyringReady();
  try {
    this.keyring.getPair(address);
    return 1;
  } catch (e) {
    return 0;
  }
};

const unlock = (address, password) => {
  isKeyringReady();
  const pair = this.keyring.getPair(address);
  password = password ? password : '';
  let decode = pair.decodePkcs8(password);
  console.log('decode:', decode);
  console.log(pair.isLocked);
};

const lock = (address) => {
  isKeyringReady();
  const pair = this.keyring.getPair(address);
  pair.lock();
  console.log(pair.isLocked);
};

const sign = (address, msg) => {
  isKeyringReady();
  try {
    const pair = this.keyring.getPair(address);
    return u8aToHex(pair.sign(stringToU8a(msg)));
  } catch (e) {
    console.error(`can not load address:${address} ${e}`);
  }
};

const signU8a = (address, u8a) => {
  isKeyringReady();
  try {
    const pair = this.keyring.getPair(address);
    return u8aToHex(pair.sign(u8a));
  } catch (e) {
    console.error(`can not load address:${address} ${e}`);
  }
}

const verify = (address, msg, sign) => {
  isKeyringReady();
  console.log('subVerify:', address, msg, sign);
  return signatureVerify(msg, sign, address);
};

const hash = (msg) => blake2AsHex(msg);

const _extractEvents = (result, eventHolder) => {
  if (!result || !result.events) {
    return;
  }

  let success = false;
  let error;
  result.events
    .filter((event) => !!event.event)
    .map(({ event: { data, method, section } }) => {
      let eventData = {
        section,
        method,
        data: data ? data.toJSON() : null,
      };

      if (section === 'system' && method === 'ExtrinsicFailed') {
        const [dispatchError] = data;
        let message = dispatchError.type;

        if (dispatchError.isModule) {
          try {
            const mod = dispatchError.asModule;
            const error = this.api.registry.findMetaError(new Uint8Array([mod.index.toNumber(), mod.error.toNumber()]));

            message = `${error.section}.${error.name}`;
          } catch (error) {
            // swallow error
            console.error('_extractEvents error:', error);
          }
        }
        eventData.message = message;
        eventHolder.push(eventData);
        
        if (this.notify_cb) {
          this.notify_cb('txUpdateEvent', eventData);
        }
        error = message;
      } else {
        eventData.message = 'ok';
        if (this.notify_cb) {
          this.notify_cb('txUpdateEvent', eventData);
        }
        eventHolder.push(eventData);
        if (section == 'system' && method == 'ExtrinsicSuccess') {
          success = true;
        }
      }
    });
  return { success, error };
};

const sendTx = (txInfo, paramList, isSudo, eventCB) => {
  return new Promise((resolve) => {
    console.log('sendTx params:', paramList);
    let tx = this.api.tx[txInfo.module][txInfo.call](...paramList);
    let eventHolder = [];

    if (isSudo) {
      tx = this.api.tx.sudo.sudo(tx);
    }

    let unsub = () => {};
    const onStatusChange = (result) => {
      if (result.status.isInBlock || result.status.isFinalized) {
        const { success, error } = _extractEvents(result, eventHolder);
        if (success) {
          resolve({ hash: tx.hash.hash.toHuman(), events: eventHolder });
        }
        if (error) {
          resolve({ error });
        }
        unsub();
      } else {
        if (this.notify_cb) {
          this.notify_cb('txStatusChange', result.status.type);
        }
      }
    };

    let keyPair;
    keyPair = this.keyring.getPair(txInfo.pubKey);

    if (!!txInfo.password) {
      try {
        keyPair.decodePkcs8(txInfo.password);
      } catch (err) {
        resolve({ error: 'password check failed' });
      }
    }

    console.log('prepare send:', txInfo);

    tx.signAndSend(keyPair, { tip: new BN(txInfo.tip, 10) }, onStatusChange)
      .then((res) => {
        unsub = res;
      })
      .catch((err) => {
        resolve({ error: err.message });
      });
  });
};

const transfer = async (srcAddress, targetAddress, amount, password) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'balances',
    call: 'transfer',
    pubKey: srcAddress,
    password,
  };

  let sep = amount.split('.');
  let int = sep[0];
  let dec = sep[1];
  if (!dec) {
    dec = '0';
  }

  let decLen = Math.min(DEC_NUM, dec.length);
  let convert = new BN(int, 10)
    .mul(new BN(Math.pow(10, DEC_NUM), 10))
    .add(new BN(dec, 10).mul(new BN(Math.pow(10, DEC_NUM - decLen))));

  console.log('amount convert:', convert.toString());

  const result = await sendTx(txInfo, [targetAddress, convert]);
  console.log('transfer result:', result);

  return result;
};

const devTransfer = async (target, num) => {
  isKeyringReady();
  isApiReady();
  //const txHash = await this.api.tx.balances.transfer(target, num).signAndSend(this.alice);

  const txInfo = {
    module: 'balances',
    call: 'transfer',
    pubKey: this.sudo.address,
  };

  // expect num is a float string rep, like "3.564"
  let convert = convertBalance(num);

  const result = await sendTx(txInfo, [target, convert]);
  console.log('transfer result:', result);

  return result;
};

// Chain api interfaces:
const createDocument = async (doc_type, doc_params, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  isKeyringReady();
  isApiReady();

  let txInfo = {
    module: 'kp',
    pubKey: sender_pub_key,
  };

  switch (doc_type) {
    case 0:
      // product publish
      txInfo.call = 'createProductPublishDocument';
      break;
    case 1:
      // product identify
      txInfo.call = 'createProductIdentifyDocument';
      break;
    case 2:
      txInfo.call = 'createProductTryDocument';
      break;
    case 3:
      // product choose
      txInfo.call = 'createProductChooseDocument';
      break;
    case 4:
      // model create
      txInfo.call = 'createModelCreateDocument';
      break;
    default:
      console.error('document type error:', document.document_type);
      return;
  }

  // create, sign and send transaction
  params = [
    doc_params,

    owner_pub_key,
    owner_sign,

    sender_pub_key,
    sender_sign,
  ];

  const result = await sendTx(txInfo, params);
  console.log('createDocument result:', result);
  return result;
};

/**
 * 
 * @param {*} comment: interface/comment
 * @param {*} owner_pub_key 
 * @param {*} owner_sign 
 * @param {*} auth_pub_key 
 * @param {*} auth_sign 
 */
const createComment = async (comment, owner_pub_key, owner_sign, auth_pub_key, auth_sign) => {
  let txInfo = {
    module: 'kp',
    call: 'createComment',
    pubKey: owner_pub_key,
  };

  params = [
    comment,

    owner_pub_key,
    owner_sign,

    auth_pub_key,
    auth_sign,
  ];

  const result = await sendTx(txInfo, params);
  console.log('createComment result:', result);
  return result;
};

const createModel = async (client_params, auth_params, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  let txInfo = {
    module: 'kp',
    call: 'createModel',
    pubKey: sender_pub_key,
  };

  params = [
    client_params,
    auth_params,

    owner_pub_key,
    owner_sign,

    sender_pub_key,
    sender_sign,
  ];

  const result = await sendTx(txInfo, params);
  console.log('createModel result:', result);
  return result;
};

const addModelDeposit = async (app_id, model_id, amount, sender_pub_key) => {
  let txInfo = {
    module: 'kp',
    call: 'addModelDeposit',
    pubKey: sender_pub_key,
  };

  const result = await sendTx(txInfo, [Number(app_id), model_id, convertBalance(amount)]);
  console.log('addModelDeposit result:', result);
  return result;
}

const disableModel = async (params, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  let txInfo = {
    module: 'kp',
    call: 'disableModel',
    pubKey: sender_pub_key,
  };

  params = [params, owner_pub_key, owner_sign, sender_pub_key, sender_sign];
  const result = await sendTx(txInfo, params);
  console.log('disableModel result:', result);
  return result;
};

const addCommodityType = async (type_id, type_desc) => {
  const txInfo = {
    module: 'kp',
    call: 'createCommodityType',
    pubKey: getDevAdmin().address,
  };

  return sendTx(txInfo, [type_id, type_desc], true);
};

const createPowerLeaderBoard = async (app_id, model_id, sender_pub_key, sender_sign) => {
  app_id = Number(app_id);

  let txInfo = {
    module: 'kp',
    call: 'createPowerLeaderBoard',
    pubKey: getDevAdmin().address,
  };

  model_id = model_id === '0' ? '' : model_id;

  params = [app_id, model_id];
  const result = await sendTx(txInfo, params, true);
  console.log('createPowerLeaderBoard result:', result);
  // here we care about 'LeaderBoardsCreated' event
  for (var event of result.events) {
    console.log("check event:", event);
    if (event.method === 'LeaderBoardsCreated') {
      console.log("found match event:", event);
      // found
      result.data = {
        block: String(event.data[0]),
        app_id: String(event.data[1]),
        model_id: hexToString(event.data[2]),
      }
      break;
    }
  }
   
  return result;
}

const setBatchModelPeriodIncome = async (params, user_key, user_sign, auth_key, auth_sign) => {
  let txInfo = {
    module: 'kp',
    call: 'setModelIncome',
    pubKey: auth_key,
  };

  return sendTx(txInfo, [params, user_key, user_sign, auth_key, auth_sign]);
};

const requestModelCycleReward = async (app_id, model_id, user_key) => {
  app_id = Number(app_id);

  let txInfo = {
    module: 'kp',
    call: 'requestModelReward',
    pubKey: user_key,
  };

  return sendTx(txInfo, [app_id, model_id]);
}

// this function only could be invoked from trust server
const appFinancedUserExchangeRequest = async (params, user_key, user_sign, server_key, server_sign) => {
  let txInfo = {
    module: 'kp',
    call: 'appFinancedUserExchangeRequest',
    pubKey: server_key,
  };

  const result = await sendTx(txInfo, [params, user_key, user_sign, server_key, server_sign]);
  return result;
};

// this function only could be invoked from trust server
const appFinancedUserExchangeConfirm = async (params, auth_key) => {
  let txInfo = {
    module: 'kp',
    call: 'appFinancedUserExchangeConfirm',
    pubKey: auth_key,
  };

  const result = await sendTx(txInfo, [params]);
  return result;
};

const appIncomeUserExchangeRequest = async (params, user_key, user_sign, server_key, server_sign) => {
  let txInfo = {
    module: 'kp',
    call: 'appIncomeRedeemRequest',
    pubKey: server_key,
  };

  const result = await sendTx(txInfo, [params, user_key, user_sign, server_key, server_sign]);
  return result;
};

const appIncomeUserExchangeConfirm = async (params, auth_key) => {
  let txInfo = {
    module: 'kp',
    call: 'appIncomeRedeemConfirm',
    pubKey: auth_key,
  };

  const result = await sendTx(txInfo, [params]);
  return result;
};

// member interfaces
/**
 * 设置APP root账户，仅在SUDO启用有效
 * @param {*} app_id
 * @param {*} app_root_pub_key APP ROOT账户公钥
 */
const membersSetAppAdmin = async (app_id, app_root_pub_key) => {
  app_id = Number(app_id);
  const sudoKey = await this.api.query.sudo.key();
  console.log('sudo key:', sudoKey);

  let txInfo = {
    module: 'members',
    call: 'setAppAdmin',
    pubKey: getDevAdmin().address,
  };

  const result = await sendTx(txInfo, [app_id, app_root_pub_key], true);
  console.log('membersSetAppAdmin result:', result);
  return result;
};

const membersSetAppRedeemAccount = async (app_id, account, sender_pub_key) => {
  app_id = Number(app_id);
  
  let txInfo = {
    module: 'members',
    call: 'setAppRedeemAccount',
    pubKey: sender_pub_key,
  };

  const result = await sendTx(txInfo, [app_id, account]);
  console.log('membersSetAppRedeemAccount result:', result);
  return result;
};

/**
 * 增加APP平台点评组成员
 * @param {*} app_id
 * @param {*} op_type "0": 增加, "1": 删除
 * @param {*} new_member_pub_key 新增成员公钥
 * @param {*} app_root_pub_key 调用者需要确保该KEY已经unlock, 并且该KEY是APP root 账户
 */
const membersOperatePlatformExpert = async (app_id, op_type, member_account, app_root_pub_key) => {
  app_id = Number(app_id);
  let txInfo = {
    module: 'members',
    call: op_type === '0' ? 'addAppPlatformExpertMember' : 'removeAppPlatformExpertMember',
    pubKey: app_root_pub_key,
  };

  const result = await sendTx(txInfo, [app_id, member_account]);
  console.log('membersOperatePlatformExpert result:', result);
  return result;
};

/**
 * 增加模型专家组成员
 * @param {*} params
 * @param {*} model_creator 模型创建者公钥
 * @param {*} model_creator_sign 模型创建者签名（签名内容为new_member_pub_key + kpt_profit_rate）
 * @param {*} new_member_pub_key 新增成员公钥
 * @param {*} kpt_profit_rate 每年模型增发kpt分成比例 浮点字符串小数点后至多4位 ("0.0000" - "1")
 */
const membersAddExpertByCreator = async (
  params,
  model_creator,
  model_creator_sign,
  new_member_pub_key,
) => {
  let txInfo = {
    module: 'members',
    call: 'addExpertMember',
    pubKey: new_member_pub_key,
  };

  const result = await sendTx(txInfo, [params, model_creator, model_creator_sign]);
  console.log('membersAddExpertByCreator result:', result);
  return result;
};

/**
 * 删除模型专家组成员
 * @param {*} model_creator 模型创建者公钥
 * @param {*} model_creator_sign 模型创建者签名
 * @param {*} sender_pub_key 发送服务端公钥
 * @param {*} sender_sign 发送服务端签名
 */
const membersRemoveExpertByCreator = async (
  params,
  model_creator,
  model_creator_sign,
  sender_pub_key,
  sender_sign
) => {
  let txInfo = {
    module: 'members',
    call: 'removeExpertMember',
    pubKey: sender_pub_key,
  };

  params = [params, model_creator, model_creator_sign, sender_pub_key, sender_sign];

  const result = await sendTx(txInfo, params);
  console.log('membersRemoveExpertByCreator result:', result);
  return result;
};

/**
 *
 * @param {*} sender_address
 * @param {*} receiver_address
 * @param {*} app_id
 * @param {*} user_id
 * @param {*} amount
 */
const membersAirDropNewUserBenefit = async (sender_address, receiver_address, app_id, user_id, amount) => {
  isKeyringReady();
  isApiReady();
  app_id = Number(app_id);

  const txInfo = {
    module: 'members',
    call: 'airDropNewUserBenefit',
    pubKey: sender_address,
  };

  // expect num is a float string rep, like "3.564"
  let sep = amount.split('.');
  let int = sep[0];
  let dec = sep[1];

  if (!dec) {
    dec = '0';
  }

  let decLen = Math.min(DEC_NUM, dec.length);
  let convert = new BN(int, 10)
    .mul(new BN(Math.pow(10, DEC_NUM), 10))
    .add(new BN(dec, 10).mul(new BN(Math.pow(10, DEC_NUM - decLen))));

  console.log('num convert:', convert.toString());

  const result = await sendTx(txInfo, [app_id, user_id, receiver_address, convert]);
  console.log('air drop result:', result);

  return result;
};

const membersAddInvestor = async (sender_pub_key, app_id, investor) => {
  isKeyringReady();
  isApiReady();
  app_id = Number(app_id);

  const txInfo = {
    module: 'members',
    call: 'addInvestorMember',
    pubKey: sender_pub_key,
  };

  console.log('membersAddInvestor:', sender_pub_key, app_id, investor);
  const result = await sendTx(txInfo, [app_id, investor]);
  console.log('membersAddInvestor result:', result);

  return result;
};

const membersRemoveInvestor = async (investor) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'members',
    call: 'removeInvestorMember',
    pubKey: getDevAdmin().address,
  };

  const result = await sendTx(txInfo, [investor], true);
  console.log('membersRemoveInvestor result:', result);

  return result;
};

const membersAddAppAdmin = async (appKeyAccount, appKeyManageParams, sign) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'members',
    call: 'addAppAdmin',
    pubKey: appKeyAccount
  };

  const result = await sendTx(txInfo, [appKeyManageParams, sign]);
  console.log('membersAddAppAdmin result:', result);

  return result;
};

const membersRemoveAppAdmin = async (appKeyAccount, appKeyManageParams, sign) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'members',
    call: 'removeAppAdmin',
    pubKey: appKeyAccount
  };

  const result = await sendTx(txInfo, [appKeyManageParams, sign]);
  console.log('membersRemoveAppAdmin result:', result);

  return result;
};

const membersAddAppKey = async (appKeyAccount, appKeyManageParams, sign) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'members',
    call: 'addAppKey',
    pubKey: appKeyAccount
  };

  const result = await sendTx(txInfo, [appKeyManageParams, sign]);
  console.log('membersAddAppKey result:', result);

  return result;
};

const membersRemoveAppKey = async (appKeyAccount, appKeyManageParams, sign) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'members',
    call: 'removeAppKey',
    pubKey: appKeyAccount
  };

  const result = await sendTx(txInfo, [appKeyManageParams, sign]);
  console.log('membersRemoveAppKey result:', result);

  return result;
};

const stableRedeem = async (app_id, cash_transaction_id, sender_pub_key) => {
  app_id = Number(app_id);
  
  let txInfo = {
    module: 'members',
    call: 'stableRedeem',
    pubKey: sender_pub_key,
  };

  params = [app_id, cash_transaction_id];
  const result = await sendTx(txInfo, params);
  console.log('stableRedeem result:', result);
  return result;
}

const setModelMax = async (app_id, max_count) => {
  isKeyringReady();
  isApiReady();
  app_id = Number(app_id);

  const txInfo = {
    module: 'kp',
    call: 'setAppModelTotal',
    pubKey: getDevAdmin().address,
  };

  const result = await sendTx(txInfo, [app_id, max_count], true);
  console.log('setModelMax result:', result);

  return result;
};

function remove0(dec) {
  for (let i = dec.length - 1; i >= 0; i--) {
    if (dec[i] === '0') {
      dec = dec.substring(0, dec.length - 1);
    }
  }

  return dec;
}

function convertBN(bnNum) {
  console.log('converting:', bnNum.toString());

  let int, dec;
  let str = bnNum.toString();
  // check str length, if over DEC_NUM, right left is dec part
  let strLen = str.length;
  if (strLen > DEC_NUM) {
    int = str.substring(0, strLen - DEC_NUM);
    dec = str.substring(strLen - DEC_NUM);
    // remove 0
    dec = remove0(dec);

    if (dec.length > 0) {
      dec = `.${dec}`;
    }
    return `${int}${dec}`;
  }

  // make up missed 0
  let zeroLen = DEC_NUM - strLen;
  dec = remove0(`${'0'.repeat(zeroLen)}${str}`);
  if (dec.length > 0) {
    dec = `.${dec}`;
  }
  return `0${dec}`;
}

// Wallet interfaces
// {"accountId":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","accountNonce":0,"availableBalance":1000000000000,"freeBalance":1000000000000,"frozenFee":0,"frozenMisc":0,"isVesting":false,"lockedBalance":0,"lockedBreakdown":[],"reservedBalance":0,"vestedBalance":0,"vestingTotal":0,"votingBalance":1000000000000}
const balancesAll = async (address, at) => {
  let result;

  result = await this.api.derive.balances.all(address);
  const {
    votingBalance: total,
    reservedBalance: reserved,
    lockedBalance: locked,
    frozenFee: bonded,
    availableBalance: transferable,
    freeBalance: free,
    lockedBreakdown: lockDetails, // [{amount, reasons, use}]
  } = result;

  return {
    total: convertBN(total.add(reserved)),
    reserved: convertBN(reserved),
    locked: convertBN(locked),
    bonded: convertBN(bonded),
    transferable: convertBN(transferable),
    free: convertBN(free),
    lockDetails: JSON.stringify(lockDetails),
  };
};

const accountInfo = async (address, block) => {
  if (!!block) {
    return queryAccountInfoWithBlockNum(address, block);
  }

  return this.api.query.system.account(address);
}

const balancesAllOrg = async (address) => this.api.derive.balances.all(address);

const txFeeEstimate = async (txInfo, paramList) => {
  const dispatchInfo = await this.api.tx[txInfo.module][txInfo.call](...paramList).paymentInfo(txInfo.address);
  console.log('txFeeEstimate:', dispatchInfo);
  return dispatchInfo;
};

// below are rpc interfaces:
const rpcGetTotalPower = async () => {
  console.log(this.api.rpc);
  let pw = await this.api.rpc.kp.totalPower();
  return Number(pw);
};

const rpcGetAccountPower = async (accountId) => {
  console.log(this.api.rpc);
  let pw = await this.api.rpc.kp.accountPower(accountId);
  return Number(pw);
};

const rpcGetCommodityPower = async (appId, cartIds) => {
  appId = Number(appId);
  let queue = [];

  console.log(`rpcGetCommodityPower {} {}`, appId, cartIds);

  const querySingle = (cartId) =>
    this.api.rpc.kp.isCommodityPowerExist({ appId, cartId }).then((isExist) => {
      console.log('isCommodityPowerExist:', cartId, isExist.toHuman());
      if (isExist.toHuman()) {
        return this.api.rpc.kp.commodityPower({ appId, cartId }).then((power) => {
          return {
            cartId,
            power: power.toString(),
          };
        });
      } else {
        return {
          cartId,
          power: 'N',
        };
      }
    });

  for (let i = 0; i < cartIds.length; i++) {
    queue.push(querySingle(cartIds[i]));
  }
  return Promise.all(queue);
};

const rpcIsCommodityInBlackList = async (appId, cartId) => {
  isApiReady();

  appId = Number(appId);
  let result = await this.api.rpc.kp.isCommodityInBlackList({appId, cartId});
  return result.toString() === 'true';
}

const rpcCheckAccountIsPlatformExpert = async (accountId, appId) => {
  appId = Number(appId);
  let result = await this.api.rpc.members.isPlatformExpert(accountId, { appId });
  console.log('rpcCheckAccountIsPlatformExpert result:', result);
  return JSON.stringify(result) === 'true';
};

const rpcCheckAccountIsModelExpert = async (accountId, appId, modelId) => {
  appId = Number(appId);
  let result = await this.api.rpc.members.isModelExpert(accountId, { appId, modelId });
  console.log('rpcCheckAccountIsModelExpert result:', result);
  return JSON.stringify(result) === 'true';
};

const rpcCheckAccountIsModelCreator = async (accountId, appId, modelId) => {
  appId = Number(appId);
  let result = await this.api.rpc.members.isModelCreator(accountId, { appId, modelId });
  console.log('rpcCheckAccountIsModelCreator result:', result);
  return JSON.stringify(result) === 'true';
};

const rpcLeaderBoardLoad = async (appId, modelId, block) => {
  appId = Number(appId);
  modelId = modelId === '0' ? '' : modelId;
  block = Number(block);
  let result = await this.api.rpc.kp.leaderBoardResult({appId, modelId, block});
  console.log('rpcLeaderBoardLoad result:', result);

  return result.toHuman();
};

// stake is $ string, like "30.21"
const rpcStakeToVote = async (account, stake) => {
  // convert stake to BN
  const factor = new BN(1e10);
  console.log("input stake:", stake);
  // onlys keep 4 positions
  stake = convertBalance(stake).div(factor);
  console.log("stake:", stake.toString());

  let result = await this.api.rpc.kp.stakeToVote({account, stake});
  let readable = convertBN(result.result.mul(factor))
  console.log('rpcStakeToVote:', readable);

  return readable;
}

const rpcAppFinanceRecord = async (appId, proposalId) => {
  isKeyringReady();
  isApiReady();

  appId = Number(appId);

  let result = await this.api.rpc.kp.appFinanceRecord({appId, proposalId});

  const factor = new BN(1e10);

  // convert result:'
  converted = {
    amount: convertBN(result.amount.mul(factor)),
    exchange: convertBN(result.exchange.mul(factor)),
    block: result.block.toString(),
    totalBalance: convertBN(result.totalBalance.mul(factor)),
    exchanged: convertBN(result.exchanged.mul(factor)),
    exchange_end_block: result.exchangeEndBlock.toString(),
    org_result: result,
  }
  
  console.log('rpcAppFinanceRecord:', converted);

  return converted;
}

const rpcModelIncomeCurrentStage = async () => {
  isKeyringReady();
  isApiReady();

  let result = await this.api.rpc.kp.modelIncomeCurrentStage();
  console.log("rpcModelIncomeCurrentStage:", result.toHuman());

  let left_seconds = Number(result.left.toString()) * 6;
  return {
    stage: result.stage.toString(),
    left_seconds
  };
};

const getAppIncomeExchangeRecords = async (appId, cycle) => {
  isKeyringReady();
  isApiReady();

  // get accounts set first
  appId = Number(appId);
  let combines = [];

  let accounts = await this.api.rpc.kp.appIncomeExchangeAccounts({appId, cycle});
  // console.log('accounts:', accounts);
  if (!!accounts && accounts.length > 0) {
    
    let queue = [];
    accounts.forEach((account) => {
      queue.push(this.api.rpc.kp.appIncomeExchangeData({appId, cycle, account}));
    });

    let results = await Promise.all(queue);
    for (let i = 0; i < results.length; i++) {
      let data = results[i];
      combines.push({
        account: accounts[i].toString(),
        exchange_amount: convertBN(data.exchangeAmount.mul(new BN(1e10))),
        status: data.status.toString(),
        pay_id: data.payId.toString()
      });
    }    
  }
  return combines;
}

const rpcAppIncomeExchangeData = async (appId, cycle, account) => {
  isKeyringReady();
  isApiReady();

  // get accounts set first
  appId = Number(appId);

  let data = await this.api.rpc.kp.appIncomeExchangeData({appId, cycle, account});

  return { 
    exchange_amount: convertBN(data.exchangeAmount.mul(new BN(1e10))),
    status: data.status.toString(),
    pay_id: data.payId.toString()
  };
};

const getAppFinanceExchangeRecords = async (appId, proposalId) => {
  isKeyringReady();
  isApiReady();

  // get accounts set first
  appId = Number(appId);
  let combines = [];

  let accounts = await this.api.rpc.kp.appFinanceExchangeAccounts({appId, proposalId});
  // console.log('accounts:', accounts);
  if (!!accounts && accounts.length > 0) {
    
    let queue = [];
    accounts.forEach((account) => {
      queue.push(this.api.rpc.kp.appFinanceExchangeData({appId, proposalId, account}));
    });

    let results = await Promise.all(queue);
    for (let i = 0; i < results.length; i++) {
      let data = results[i];
      combines.push({
        account: accounts[i].toString(),
        exchange_amount: convertBN(data.exchangeAmount.mul(new BN(1e10))),
        status: data.status.toString(),
        pay_id: data.payId.toString()
      });
    }    
  }
  return combines;
}

const rpcAppFinanceExchangeData = async (appId, proposalId, account) => {
  isKeyringReady();
  isApiReady();

  // get accounts set first
  appId = Number(appId);

  let data = await this.api.rpc.kp.appFinanceExchangeData({appId, proposalId, account});

  return { 
    exchange_amount: convertBN(data.exchangeAmount.mul(new BN(1e10))),
    status: data.status.toString(),
    pay_id: data.payId.toString()
  };
};

const rpcIsTechMemberSign = async (account, msg, sign) => {
  isKeyringReady();
  isApiReady();

  console.log(`params: ${account} ${msg} ${sign}`);
  // convert sign
  sign = sign.substr(2);

  return this.api.rpc.kp.isTechMemberSign({account, msg, sign});
};

const rpcModelDisputeRecord = async (appId, commentId) => {
  isKeyringReady();
  isApiReady();

  let record = await this.api.rpc.kp.modelDepositRecord({appId, commentId});
  console.log("record:", JSON.stringify(record));
  return record.toJSON();
};

const rpcCommodityPowerSlashRecord = async (appId, commentId) => {
  isKeyringReady();
  isApiReady();

  let record = await this.api.rpc.kp.commodityPowerSlashRecord({appId, commentId});
  return record.toJSON();
};

// chain constant api
const constBalanceExistentialDeposit = () => {
  let v = this.api.consts.balances.existentialDeposit;
  console.log('ExistentialDeposit:', v.toString());

  return convertBN(v);
};

const rpcMiscDocumentPower = async (appId, documentId) => {
  isKeyringReady();
  isApiReady();

  let result = await this.api.rpc.kp.miscDocumentPower({appId: Number(appId), documentId});
  return result.toString();
};

// democracy
const createPreImage = (txModule, method, paramList) => {
  let tx = this.api.tx[txModule][method](...paramList);
  return tx.method.toHex();
};

const rpcModelDeposit = async (appId, modelId) => {
  isKeyringReady();
  isApiReady();

  let result = await this.api.rpc.kp.modelDeposit({appId: Number(appId), modelId});
  return result.div(new BN(10000)).toString();
}

const rpcPowerRatio = async (accountId) => {
  isKeyringReady();
  isApiReady();

  let result = await this.api.rpc.kp.powerRatio(accountId);
  console.log(`rpcPowerRatio: ${result}`)
  // what we got is a converstion from mini balance
  let mini = this.api.consts.balances.existentialDeposit;
  let ratio = Number(result.toString()) / Number(mini.toString());
  return ratio;
}

const submitPreimage = async (image, pubKey) => {
  const txInfo = {
    module: 'democracy',
    call: 'notePreimage',
    pubKey,
  };

  let result = await sendTx(txInfo, [image], false);
  console.log('submitPreimage result:', result);
  return result;
}

const submitProposal = async (imageHash, deposit, pubKey) => {
  const txInfo = {
    module: 'democracy',
    call: 'propose',
    pubKey,
  };

  deposit = getDeposit(deposit);
  result = await sendTx(txInfo, [imageHash, deposit], false);
  console.log(`submitProposal result:${JSON.stringify(result)}`);

  if (result.error) {
    return { 
      error: result.error
    }
  } else {
    return {
      hash: result.hash,
      proposal_idx: extractProposalIdx(result.events),
      proposal_hash: imageHash
    }
  }
};

const getDeposit = (deposit) => {
  let min = this.api.consts.democracy.minimumDeposit;

  if (!!deposit) {
    deposit = convertBalance(deposit);
    if (min.gt(deposit)) {
      // deposit too small, use min
      deposit = min;
    }
  } else {
    deposit = min;
  }

  console.log('getDeposit:', min.toString(), deposit.toString());

  return deposit;
};

const democracyPowerComplain = async (powerComplain, sender_pub_key, deposit) => {
  isKeyringReady();
  isApiReady();

  let { app_id, cart_id, comment_id } = powerComplain;
  app_id = Number(app_id);

  let image = createPreImage('kp', 'democracySlashCommodityPower', [app_id, cart_id, comment_id, sender_pub_key]);
  let imageHash = blake2AsHex(image);
  console.log('imageHash:', imageHash);

  // submit pre-image first
  await submitPreimage(image, sender_pub_key);
  const result = await submitProposal(imageHash, deposit, sender_pub_key);

  return result;
};

const democracyModelDispute = async (modelDispute, sender_pub_key, deposit) => {
  isKeyringReady();
  isApiReady();

  let { app_id, model_id, dispute_type, comment_id } = modelDispute;
  app_id = Number(app_id);

  let image = createPreImage('kp', 'democracyModelDispute', [app_id, model_id, dispute_type, comment_id, sender_pub_key]);
  let imageHash = blake2AsHex(image);
  console.log('imageHash:', imageHash);

  // submit pre-image first
  await submitPreimage(image, sender_pub_key);
  const result = await submitProposal(imageHash, deposit, sender_pub_key);
  
  return result;
};

const democracyAddApp = async (appAdd, user_key, user_sign, deposit) => {
  isKeyringReady();
  isApiReady();

  let image = createPreImage('kp', 'democracyAddApp', [appAdd, user_key, user_sign]);
  let imageHash = blake2AsHex(image);
  console.log('imageHash:', imageHash);

  // submit pre-image first
  await submitPreimage(image, user_key);
  const result = await submitProposal(imageHash, deposit, user_key);

  return result;
};

const extractProposalIdx = (events) => {
  for (let i = 0; i < events.length; i++ ) {
    let event = events[i];
    if (event.section == 'democracy' && event.method == 'Proposed') {
      return event.data[0]
    }
  }

  return -1;
};

// SUDO code for democracyAddApp
const sudoAddApp = async (params, user_key, user_sign) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'kp',
    call: 'democracyAddApp',
    pubKey: getDevAdmin().address,
  };

  const result = await sendTx(txInfo, [params, user_key, user_sign], true);
  console.log('sudoAddApp result:', JSON.stringify(result));

  for (var event of result.events) {
    console.log("check event:", JSON.stringify(event));
    if (event.method === 'AppAdded') {
      console.log("found match event:", event);
      // found
      result.data = {
        app_id: String(event.data[0]),
      }
      break;
    }
  }

  return result.data;
};

const democracyAppFinanced = async (financedParams, investorAccount, investorSign, authServerAccount, authSign, deposit) => {
  isKeyringReady();
  isApiReady();

  let image = createPreImage('kp', 'democracyAppFinanced', [
    financedParams,
    investorAccount,
    investorSign,
    authServerAccount,
    authSign
  ]);
  
  let imageHash = blake2AsHex(image);
  console.log('imageHash:', imageHash);

  // submit pre-image first
  await submitPreimage(image, authServerAccount);
  const result = await submitProposal(imageHash, deposit, authServerAccount);

  return result;
};

// SUDO test code for app financed
const sudoAppFinance = async (params, investorAccount, investorSign, authServerAccount, authSign) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'kp',
    call: 'democracyAppFinanced',
    pubKey: getDevAdmin().address,
  };

  const result = await sendTx(txInfo, [params, investorAccount, investorSign, authServerAccount, authSign], true);
  console.log('sudoAppFinance result:', result);

  return result;
}

// Some chain storage query interfaces
const queryKpDocuments = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.kPDocumentDataByIdHash;
  //console.log('queryKpModels:', await entry.keys());
  const store = await entry.entries();
  console.log('queryKpDocuments len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryKpModels = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.kPModelDataByIdHash;
  //console.log('queryKpModels:', await entry.keys());
  const store = await entry.entries();
  console.log('queryKpModels len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryKpDocumentPower = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.kPDocumentPowerByIdHash;
  //console.log('queryKpModels:', await entry.keys());
  const store = await entry.entries();
  console.log('queryKpDocumentPower len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryKpComments = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.kPCommentDataByIdHash;
  //console.log('queryKpModels:', await entry.keys());
  const store = await entry.entries();
  console.log('queryKpComments len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryAppTypes = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.appIdRange;

  const store = await entry.entries();
  console.log('queryAppTypes len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryMinerPower = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.minerPowerByAccount;

  const store = await entry.entries();
  console.log('queryMinerPower len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryAccountAttendPower = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.accountAttendPowerMap;

  const store = await entry.entries();
  console.log('queryAccountAttendPower len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryLeaderBoardRecords = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.appLeaderBoardRcord;

  const store = await entry.entries();
  console.log('queryLeaderBoardRecords len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

//AppModelCommodityLeaderBoards
const queryRealtimeLeaderBoard = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.appModelCommodityLeaderBoards;

  const store = await entry.entries();
  console.log('queryRealtimeLeaderBoard len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryAccountCommodities = async () => {
  isKeyringReady();
  isApiReady();

  const store = await entry.entries();
  console.log('queryAccountCommodities len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryCommoditySlashRecords = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.commoditySlashRecords;
  const store = await entry.entries();
  console.log('queryCommoditySlashRecords len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
}

const queryModelDisputeRecords = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.modelDisputeRecords;
  const store = await entry.entries();
  console.log('queryModelDisputeRecords len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
}

const queryApps = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.members.appDataMap;

  const store = await entry.entries();
  console.log('queryApps len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push({
      app_id: key.args[0].toString(),
      name: u8aToString(exposure.name),
      stake: result.value.stake,
      return_rate: result.value.returnRate
    });
  });

  return results;
};

const stableExchange = async (app_id, cash_receipt, receiver, amount, sender_pub_key) => {
  isKeyringReady();
  isApiReady();

  app_id = Number(app_id);
  amount = convertBalance(amount);

  const txInfo = {
    module: 'members',
    call: 'stableExchange',
    pubKey: sender_pub_key,
  };

  const result = await sendTx(txInfo, [amount, receiver, app_id, cash_receipt], false);
  console.log('stableExchange result:', result);

  return result;
};

const queryTotalIssuance = async () => {
  isKeyringReady();
  isApiReady();

  let blockHash = await this.api.rpc.chain.getBlockHash(0);
  let balance = await this.api.query.balances.totalIssuance.at(blockHash);
  console.log("totalIssuance:", convertBN(balance));

  let current = await this.api.query.balances.totalIssuance();

  console.log("diff:", convertBN(current.sub(balance)));

  return balance;
};

const queryAccountInfoWithBlockNum = async (accountId, blockNum) => {
  isKeyringReady();
  isApiReady();

  let blockHash = await this.api.rpc.chain.getBlockHash(blockNum);
  console.log("blockHash:", blockNum, blockHash);

  const account_info = await this.api.query.system.account.at(blockHash, accountId)

  console.log("account info:", account_info.toHuman());

  return account_info;
};

const TREASURY_ACCOUNT = stringToU8a('modlpy/trfin'.padEnd(32, '\0'));//融资
const TRMODEL_ACCOUNT = stringToU8a('modlpy/trmod'.padEnd(32, '\0'));//模型
const ACMODEL_ACCOUNT = stringToU8a('modlpy/acmod'.padEnd(32, '\0'));//模型
const TECHNOLOGY_ACCOUNT = stringToU8a('modlpy/trtch'.padEnd(32, '\0'));//技术

const queryHistoryLiquid = async (blockNum) => {
  isKeyringReady();
  isApiReady();

  let blockHash = await this.api.rpc.chain.getBlockHash(blockNum);

  let totalIssuance = await this.api.query.balances.totalIssuance.at(blockHash);
  let fund1 = await this.api.derive.balances.account(TREASURY_ACCOUNT);
  let fund2 = await this.api.derive.balances.account(TRMODEL_ACCOUNT);
  let fund3 = await this.api.derive.balances.account(ACMODEL_ACCOUNT);
  let fund4 = await this.api.derive.balances.account(TECHNOLOGY_ACCOUNT);

  let balance = totalIssuance.sub(fund1.freeBalance).sub(fund2.freeBalance).sub(fund3.freeBalance).sub(fund4.freeBalance);

  console.log("balance:", balance.toString());
  return balance;
}

const queryAppFinancedUserPortion = async (accountId, appId, proposalId) => {
  isKeyringReady();
  isApiReady();

  let appFinancedRecord = await rpcAppFinanceRecord(Number(appId), proposalId);

  appFinancedRecord = appFinancedRecord.org_result;
  if (appFinancedRecord.block.eq(new BN(0))) {
    console.error("queryAppFinancedUserPortion not found record", appId, proposalId)
    return null;
  }

  // according block number to read user history balance
  let accountInfo = await queryAccountInfoWithBlockNum(accountId, appFinancedRecord.block);
  let historyBalance = accountInfo.data.free;

  let maxAmount = appFinancedRecord.exchange.mul(historyBalance).div(appFinancedRecord.totalBalance);
  // remove decimal point
  maxAmount = maxAmount.div(new BN(1e14)).toString();
  console.log("queryAppFinancedUserPortion:", maxAmount);
  return maxAmount;
}

const queryAppCycleIncomeUserPortion = async (accountId, appId, cycle) => {
  isKeyringReady();
  isApiReady();

  // make sure in model reward stage
  /*let result = await this.api.rpc.kp.modelIncomeCurrentStage();
  if (result.stage.toString() != '2') {
    console.warn('not in rewarding stage');
    return { 
      error: 'not in rewarding stage'
    };
  }*/

  // in rewarding stage, compute stage block height
  let periodBlock = Number(this.api.consts.kp.modelIncomeCyclePeriod.toString());
  let best = await this.api.derive.chain.bestNumber();
  let currentBlock = Number(best.toString());

  if (cycle === undefined) {
    cycle = Math.floor(currentBlock / periodBlock);
  }
  // reverse compute tracking point (every cycle end)
  // since we are in rewarding stage, this will not be overflowed
  let trackPoint = cycle * periodBlock;
  console.log("trackPoint:", trackPoint);
  if (trackPoint > currentBlock) {
    return {
      error: "you are querying future"
    };
  }

  let trackPointBalance = await queryHistoryLiquid(trackPoint);
  trackPointBalance = convertBN(trackPointBalance);
  let accountInfo = await queryAccountInfoWithBlockNum(accountId, trackPoint);
  let historyBalance = convertBN(accountInfo.data.free);

  // get cycle income and app rate
  let appConfig = await queryAppData(appId);
  let appCycleRecord = await queryAppCycleIncome(appId, cycle);
  if (!appCycleRecord) {
    console.warn("not found target cycle");
    return { 
      error: 'not found target cycle'
    };
  }

  let income = appCycleRecord.income.toNumber();
  if (income <= 0) {
    return { 
      error: 'income zero'
    };
  }

  let rate = (appConfig.returnRate.toNumber() / 10000);
  if (rate <= 0) {
    return { 
      error: 'app return rate zero'
    };
  }

  let amount = Math.floor(income * rate / 100);
  let portion = (amount * historyBalance / trackPointBalance).toFixed(2);

  console.log(`queryAppCycleIncomeUserPortion: ${currentBlock} ${periodBlock} ${cycle} ${trackPoint} ${trackPointBalance.toString()} ${historyBalance.toString()} ${amount} ${portion}`);

  return {
    portion,
    cycle
  }
};

const queryAppFinancedRecords = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.appFinancedRecord;

  const store = await entry.entries();
  console.log('queryAppFinancedRecords len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryCommodityPower = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.kPPurchasePowerByIdHash;

  const store = await entry.entries();
  console.log('queryCommodityPower len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
}

const queryAccountCommentStat = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.kPCommentAccountRecordMap;

  const store = await entry.entries();
  console.log('queryAccountCommentStat len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryModelCycleIncomeRewardStore = async () => {
  isKeyringReady();
  isApiReady();

  const entry = await this.api.query.kp.modelCycleIncomeRewardStore;

  const store = await entry.entries();
  console.log('queryModelCycleIncomeRewardStore len:', store.length);

  let results = [];

  store.forEach(([key, exposure]) => {
    let result = {
      key: key.args.map((k) => k.toHuman()),
      value: exposure.toHuman(),
    };
    console.log('key arguments:', result.key);
    console.log('     exposure:', result.value);

    results.push(result);
  });

  return results;
};

const queryAppAdmins = async (app_id) => {
  isKeyringReady();
  isApiReady();

  return this.api.query.members.appAdmins(app_id);
}

const queryAppKeys = async (app_id) => {
  isKeyringReady();
  isApiReady();

  return this.api.query.members.appKeys(app_id);
}

const queryAppData = async (app_id) => {
  isKeyringReady();
  isApiReady();

  return this.api.query.members.appDataMap(app_id);
}

const queryAppCycleIncome = async (app_id, cycle) => {
  isKeyringReady();
  isApiReady();

  //AppCycleIncome
  const store = await this.api.query.kp.appCycleIncome.entries();
  console.log('queryAppCycleIncome len:', store.length);

  
  for (const entry of store) {
    const exposure = entry[1];
    console.log("queryAppCycleIncome:", exposure.toHuman());
    if (exposure.appId.toString() === app_id.toString() && exposure.cycle.toNumber() === cycle) {
      // found
      return exposure;
    }
  }

  return null;
};

const isPermitSubmitAppFinance = async () => {
  isKeyringReady();
  isApiReady();

  // get last app finance record
  const lastKey = await this.api.query.kp.appFinancedLast();
  console.log("lastkey:", lastKey);

  // query last record
  const lastRecord = await this.api.query.kp.appFinancedRecord(lastKey.toString());
  console.log("lastRecord:", lastRecord.toHuman());

  // get current block
  const lastHeader = await this.api.rpc.chain.getHeader();
  console.log("lastHeader:", lastHeader.number.unwrap());

  //if (lastHeader.number.unwrap())
  return (lastHeader.number.unwrap().gt(lastRecord.exchangeEndBlock)); 
}

const queryTechMembers = async () => {
  isKeyringReady();
  isApiReady();

  let list = await this.api.query.technicalMembership.members();
  return list.toHuman();
}

const paramsSign = (paramsType, interfaceObj, signer_address) => {
  let buf;
  switch (paramsType) {
    case AppFinancedProposalParams: {
      buf = InterfaceAppFinancedProposalParams.encode(interfaceObj);
      break;
    }
    case AppFinancedUserExchangeParams:{
      buf = InterfaceAppFinancedUserExchangeParams.encode(interfaceObj);
      break;
    }
    case AppFinancedUserExchangeConfirmParams:{
      buf = InterfaceAppFinancedUserExchangeConfirmParams.encode(interfaceObj);
      break;
    }
    case CommentData: {
      buf = InterfaceComment.encode(interfaceObj);
      break;
    }
    case AddAppParams: {
      buf = InterfaceAddAppParams.encode(interfaceObj);
      break;
    }
    case AuthParamsCreateModel: {
      buf = InterfaceAuthParamsCreateModel.encode(interfaceObj);
      break;
    }
    case ClientParamsCreateModel: {
      buf = InterfaceClientParamsCreateModel.encode(interfaceObj);
      break;
    }
    case ClientParamsCreatePublishDoc: {
      buf = InterfaceClientParamsCreatePublishDoc.encode(interfaceObj);
      break;
    }
    case ClientParamsCreateIdentifyDoc: {
      buf = InterfaceClientParamsCreateIdentifyDoc.encode(interfaceObj);
      break;
    }
    case ClientParamsCreateTryDoc: {
      buf = InterfaceClientParamsCreateTryDoc.encode(interfaceObj);
      break;
    }
    case ClientParamsCreateChooseDoc: {
      buf = InterfaceClientParamsCreateChooseDoc.encode(interfaceObj);
      break;
    }
    case ClientParamsCreateModelDoc: {
      buf = InterfaceClientParamsCreateModelDoc.encode(interfaceObj);
      break;
    }
    case ModelExpertAddMemberParams: {
      buf = InterfaceModelExpertAddMemberParams.encode(interfaceObj);
      break;
    }
    case ModelExpertDelMemberParams: {
      buf = InterfaceModelExpertDelMemberParams.encode(interfaceObj);
      break;
    }
    case ModelIncomeCollectingParam: {
      buf = InterfaceModelIncomeCollectingParam.encode(interfaceObj);
      break;
    }
    case AppKeyManageParams: {
      buf = InterfaceAppKeyManageParams.encode(interfaceObj);
      break;
    }
    case AppIncomeRedeemParams: {
      buf = InterfaceAppIncomeRedeemParams.encode(interfaceObj);
      break;
    }
    case AppIncomeRedeemConfirmParams: {
      buf = InterfaceAppIncomeRedeemConfirmParams.encode(interfaceObj);
      break;
    }
    case DisableModelParams: {
      buf = InterfaceDisableModelParams.encode(interfaceObj);
      break;
    }
    default:
      break;
  }

  if (!!buf) {
    console.log("buf:", buf);
    return signU8a(signer_address, buf);
  } else {
    console.error("paramsSigner fail:", paramsType, interfaceObj, signer_address);
  }
}

// wrap interface creation
const createSignObject = (params_type, params_data) => {
  switch (params_type) {
    case AppFinancedProposalParams: {
      const {account, app_id, proposal_id, exchange, amount} = params_data; 
      return InterfaceAppFinancedProposalParams.create(account, app_id, proposal_id, exchange, amount);
    }
    case AppFinancedUserExchangeParams:{
      const {account, app_id, proposal_id, exchange_amount} = params_data;
      return InterfaceAppFinancedUserExchangeParams.create(account, app_id, proposal_id, exchange_amount);
    }
    case AppFinancedUserExchangeConfirmParams:{
      const {account, app_id, pay_id, proposal_id} = params_data;
      return InterfaceAppFinancedUserExchangeConfirmParams.create(account, app_id, pay_id, proposal_id);
    }
    case CommentData: {
      const {app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend} = params_data;
      return InterfaceComment.create(app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend);
    }
    case AddAppParams: {
      const {app_type, app_name, app_key, app_admin_key, return_rate} = params_data;
      return InterfaceAddAppParams.create(app_type, app_name, app_key, app_admin_key, return_rate);
    }
    case AuthParamsCreateModel: {
      const {model_id} = params_data;
      return InterfaceAuthParamsCreateModel.create(model_id);
    }
    case ClientParamsCreateModel: {
      const {app_id, expert_id, commodity_name, commodity_type, content_hash} = params_data;
      return InterfaceClientParamsCreateModel.create(app_id, expert_id, commodity_name, commodity_type, content_hash);
    }
    case ClientParamsCreatePublishDoc: {
      const {app_id, document_id, model_id, product_id, content_hash, para_issue_rate, self_issue_rate, attend_rate} = params_data;
      return InterfaceClientParamsCreatePublishDoc.create(app_id, document_id, model_id, product_id, content_hash, para_issue_rate, self_issue_rate, attend_rate);
    }
    case ClientParamsCreateIdentifyDoc: {
      const {app_id, document_id, product_id, content_hash, goods_price, ident_rate, ident_consistence, seller_consistence, cart_id} = params_data;
      return InterfaceClientParamsCreateIdentifyDoc.create(app_id, document_id, product_id, content_hash, goods_price, ident_rate, ident_consistence, seller_consistence, cart_id);
    }
    case ClientParamsCreateTryDoc: {
      const {app_id, document_id, product_id, content_hash, goods_price, offset_rate, true_rate, seller_consistence, cart_id} = params_data;
      return InterfaceClientParamsCreateTryDoc.create(app_id, document_id, product_id, content_hash, goods_price, offset_rate, true_rate, seller_consistence, cart_id);
    }
    case ClientParamsCreateChooseDoc: {
      const {app_id, document_id, model_id, product_id, content_hash, sell_count, try_count} = params_data;
      return InterfaceClientParamsCreateChooseDoc.create(app_id, document_id, model_id, product_id, content_hash, sell_count, try_count);
    }
    case ClientParamsCreateModelDoc: {
      const {app_id, document_id, model_id, product_id, content_hash, producer_count, product_count} = params_data;
      return InterfaceClientParamsCreateModelDoc.create(app_id, document_id, model_id, product_id, content_hash, producer_count, product_count);
    }
    case ModelExpertAddMemberParams: {
      const {app_id, model_id, kpt_profit_rate} = params_data;
      return InterfaceModelExpertAddMemberParams.create(app_id, model_id, kpt_profit_rate);
    }
    case ModelExpertDelMemberParams: {
      const {app_id, model_id, member} = params_data;
      return InterfaceModelExpertDelMemberParams.create(app_id, model_id, member);
    }
    case ModelIncomeCollectingParam: {
      const {app_id, incomes} = params_data;
      return InterfaceModelIncomeCollectingParam.create(app_id, incomes);
    }
    case AppKeyManageParams: {
      const {app_id, admin, member} = params_data;
      return InterfaceAppKeyManageParams.create(app_id, admin, member);
    }
    case AppIncomeRedeemParams: {
      const {app_id, account, cycle, exchange_amount} = params_data;
      return InterfaceAppIncomeRedeemParams.create(app_id, account, cycle, exchange_amount);
    }
    case AppIncomeRedeemConfirmParams: {
      const {app_id, account, cycle, pay_id} = params_data;
      return InterfaceAppIncomeRedeemConfirmParams.create(app_id, account, cycle, pay_id);
    }
    case DisableModelParams: {
      const {app_id, model_id} = params_data;
      return InterfaceDisableModelParams.create(app_id, model_id);
    }
    default:
      console.error("unknown type:", params_type);
      return null;
  }
};

const test = () => {
  let result = encode('AppFinancedProposalParams', {
    account: '5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk',
    appId: 123,
    proposalId: 'abc',
    exchange: convertBalance('100'),
    amount: convertBalance('200'),
  });

  console.log("test result:", result);
  let hex = u8aToHex(result);
  console.log('hex:', hex);
  let ac = newAccount('a', '123456');
  unlock(ac.json.address, '123456');
  let sign = signU8a(ac.json.address, result);
  console.log('sign:', sign);
}

// Wallet required additional interfaces
const bond = async (account, amount, reward_to) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'staking',
    call: 'bond',
    pubKey: account,
  };

  const result = await sendTx(txInfo, [account, convertBalance(amount), reward_to]);
  console.log("bond:", result);
  return result;
}

const fetchStakingOverview = async () => {
  isKeyringReady();
  isApiReady();

  const data = await Promise.all([
    this.api.derive.staking.overview(),
    this.api.derive.staking.stashes(),
    this.api.query.staking.nominators.entries(),
  ]);
  const stakingOverview = data[0];
  const allStashes = _accountsToString(data[1]);
  const next = allStashes.filter(
    (e) => !stakingOverview.validators.includes(e)
  );
  const nominators = _getNominators(data[2]);

  const allElected = _accountsToString(stakingOverview.nextElected);
  const validatorIds = _accountsToString(stakingOverview.validators);
  const validators = _filterAccounts(validatorIds, []);
  const elected = _filterAccounts(allElected, validatorIds);
  const waiting = _filterAccounts(next, allElected);

  return {
    elected,
    validators,
    waiting,
    nominators,
  };
};

const fetchValidatorInfos = async () => {
  isKeyringReady();
  isApiReady();
  let { info } = await this.api.derive.staking.electedInfo();
  return info.map(item => {
    let {accountId, exposure, validatorPrefs } = item;
    return {
      accountId: accountId.toString(),
      bondInfo: {
        total: exposure.total.toHuman(),
        own: exposure.own.toHuman()
      },
      commission: validatorPrefs.commission.toString()
    }
  });
}

function _accountsToString(accounts) {
  return accounts.map((accountId) => accountId.toString());
}

function _filterAccounts(accounts = [], without) {
  return accounts.filter((accountId) => !without.includes(accountId));
}

function _getNominators(nominations) {
  return nominations.reduce((mapped, [key, optNoms]) => {
    if (optNoms.isSome) {
      const nominatorId = key.args[0].toString();

      optNoms.unwrap().targets.forEach((_validatorId, index) => {
        const validatorId = _validatorId.toString();
        const info = [nominatorId, index + 1];

        if (!mapped[validatorId]) {
          mapped[validatorId] = [info];
        } else {
          mapped[validatorId].push(info);
        }
      });
    }

    return mapped;
  }, {});
}

const _getOwnStash = async (accountId) => {
  let stashId = accountId;
  let isOwnStash = false;
  const ownStash = await Promise.all([
    this.api.query.staking.bonded(accountId),
    this.api.query.staking.ledger(accountId),
  ]);
  if (ownStash[0].isSome) {
    isOwnStash = true;
  }
  if (ownStash[1].isSome) {
    stashId = ownStash[1].unwrap().stash.toString();
    if (accountId != stashId) {
      isOwnStash = false;
    }
  }
  return [stashId, isOwnStash];
};

function _toIdString(id) {
  return id ? id.toString() : null;
}

function _extractStakerState(
  accountId,
  stashId,
  allStashes,
  [
    isOwnStash,
    {
      controllerId: _controllerId,
      exposure,
      nextSessionIds,
      nominators,
      rewardDestination,
      sessionIds,
      stakingLedger,
      validatorPrefs,
    },
    validateInfo,
  ]
) {
  const isStashNominating = !!nominators && nominators.length > 0;
  const isStashValidating =
    !(Array.isArray(validateInfo)
      ? validateInfo[1].isEmpty
      : validateInfo.isEmpty) || (!!allStashes && allStashes.includes(stashId));
  const nextConcat = u8aConcat(...nextSessionIds.map((id) => id.toU8a()));
  const currConcat = u8aConcat(...sessionIds.map((id) => id.toU8a()));
  const controllerId = _toIdString(_controllerId);

  return {
    controllerId,
    destination: rewardDestination ? rewardDestination.toString().toLowerCase() : undefined,
    destinationId: rewardDestination ? rewardDestination.toNumber() : 0,
    exposure,
    hexSessionIdNext: u8aToHex(nextConcat, 48),
    hexSessionIdQueue: u8aToHex(
      currConcat.length ? currConcat : nextConcat,
      48
    ),
    isOwnController: accountId == controllerId,
    isOwnStash,
    isStashNominating,
    isStashValidating,
    // we assume that all ids are non-null
    nominating: nominators ? nominators.map(_toIdString) : undefined,
    sessionIds: (nextSessionIds.length ? nextSessionIds : sessionIds).map(
      _toIdString
    ),
    stakingLedger,
    stashId,
    validatorPrefs,
  };
}

function _extractUnbondings(stakingInfo, progress) {
  if (!stakingInfo || !stakingInfo.unlocking || !progress) {
    return { mapped: [], total: BN_ZERO };
  }

  const mapped = stakingInfo.unlocking
    .filter(
      ({ remainingEras, value }) =>
        value.gt(BN_ZERO) && remainingEras.gt(BN_ZERO)
    )
    .map((unlock) => [
      unlock,
      unlock.remainingEras
        .sub(BN_ONE)
        .imul(progress.eraLength)
        .iadd(progress.eraLength)
        .isub(progress.eraProgress)
        .toNumber(),
    ]);
  const total = mapped.reduce(
    (total, [{ value }]) => total.iadd(value),
    new BN(0)
  );

  return {
    mapped: mapped.map((i) => [
      formatBalance(i[0].value, { forceUnit: "-", withSi: false }),
      i[1],
    ]),
    total,
  };
}

function _extractInactiveState(
  api,
  stashId,
  slashes,
  nominees,
  activeEra,
  submittedIn,
  exposures
) {
  const max = api.consts.staking ? api.consts.staking.maxNominatorRewardedPerValidator : undefined;

  // chilled
  const nomsChilled = nominees.filter((_, index) => {
    if (slashes[index].isNone) {
      return false;
    }

    const { lastNonzeroSlash } = slashes[index].unwrap();

    return !lastNonzeroSlash.isZero() && lastNonzeroSlash.gte(submittedIn);
  });

  // all nominations that are oversubscribed
  const nomsOver = exposures
    .map(({ others }) =>
      others.sort((a, b) => b.value.unwrap().cmp(a.value.unwrap()))
    )
    .map((others, index) =>
      !max || max.gtn(others.map(({ who }) => who.toString()).indexOf(stashId))
        ? null
        : nominees[index]
    )
    .filter((nominee) => !!nominee && !nomsChilled.includes(nominee));

  // first a blanket find of nominations not in the active set
  let nomsInactive = exposures
    .map((exposure, index) =>
      exposure.others.some(({ who }) => who.eq(stashId))
        ? null
        : nominees[index]
    )
    .filter((nominee) => !!nominee);

  // waiting if validator is inactive or we have not submitted long enough ago
  const nomsWaiting = exposures
    .map((exposure, index) =>
      exposure.total.unwrap().isZero() ||
      (nomsInactive.includes(nominees[index]) && submittedIn.eq(activeEra))
        ? nominees[index]
        : null
    )
    .filter((nominee) => !!nominee)
    .filter(
      (nominee) => !nomsChilled.includes(nominee) && !nomsOver.includes(nominee)
    );

  // filter based on all inactives
  const nomsActive = nominees.filter(
    (nominee) =>
      !nomsInactive.includes(nominee) &&
      !nomsChilled.includes(nominee) &&
      !nomsOver.includes(nominee)
  );

  // inactive also contains waiting, remove those
  nomsInactive = nomsInactive.filter(
    (nominee) =>
      !nomsWaiting.includes(nominee) &&
      !nomsChilled.includes(nominee) &&
      !nomsOver.includes(nominee)
  );

  return {
    nomsActive,
    nomsChilled,
    nomsInactive,
    nomsOver,
    nomsWaiting,
  };
}

const _getInactives = async (stashId, nominees) => {
  const indexes = await this.api.derive.session.indexes();
  const [optNominators, ...exposuresAndSpans] = await Promise.all(
    [this.api.query.staking.nominators(stashId)]
      .concat(
        nominees.map((id) =>
          this.api.query.staking.erasStakers(indexes.activeEra, id)
        )
      )
      .concat(nominees.map((id) => this.api.query.staking.slashingSpans(id)))
  );
  const exposures = exposuresAndSpans.slice(0, nominees.length);
  const slashes = exposuresAndSpans.slice(nominees.length);
  return _extractInactiveState(
    this.api,
    stashId,
    slashes,
    nominees,
    indexes.activeEra,
    optNominators.unwrapOrDefault().submittedIn,
    exposures
  );
};

const getOwnStashInfo = async (accountId) => {
  const [stashId, isOwnStash] = await _getOwnStash(accountId);
  console.log(`getOwnStashInfo: ${stashId} ${isOwnStash}`)
  const [account, validators, allStashes, progress] = await Promise.all([
    this.api.derive.staking.account(stashId),
    this.api.query.staking.validators(stashId),
    this.api.derive.staking.stashes().then((res) => res.map((i) => i.toString())),
    this.api.derive.session.progress(),
  ]);
  const stashInfo = _extractStakerState(accountId, stashId, allStashes, [
    isOwnStash,
    account,
    validators,
  ]);
  const unbondings = _extractUnbondings(account, progress);
  let inactives;
  if (stashInfo.nominating && stashInfo.nominating.length) {
    inactives = await _getInactives(stashId, stashInfo.nominating);
  }
  /*return {
    account,
    ...stashInfo,
    inactives,
    unbondings,
  };*/

  console.log("getOwnStashInfo account: ", JSON.stringify(account));

  return { 
    bond: convertBN(account.stakingLedger.total),
    unlocking: convertBN(unbondings.total),
    redeemable: convertBN(account.redeemable),
    ...stashInfo
  };
};

const nominate = async (account, targets) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'staking',
    call: 'nominate',
    pubKey: account,
  };

  const result = await sendTx(txInfo, [targets]);
  console.log("nominate:", result);
  return result;
};

const fetchReferendums = async (address) => {
  isKeyringReady();
  isApiReady();

  const referendums = await this.api.derive.democracy.referendums();
  const sqrtElectorate = await this.api.derive.democracy.sqrtElectorate();
  const details = referendums.map(({ image, imageHash, status, votedAye, votedNay, votedTotal, votes }) => {
    let callData;
    let parsedMeta = {};
    if (image && image.proposal) {
      callData = this.api.registry.findMetaCall(image.proposal.callIndex);
      parsedMeta = _extractMetaData(callData.meta);
      image.proposal = image.proposal.toHuman();
      if (image.proposal.method == "setCode") {
        const args = image.proposal.args;
        image.proposal.args = [args[0].slice(0, 16) + "..." + args[0].slice(args[0].length - 16)];
      }
    }

    const changes = approxChanges(status.threshold, sqrtElectorate, {
      votedAye,
      votedNay,
      votedTotal,
    });

    const voted = votes.find((i) => i.accountId.toString() == address);
    const userVoted = voted
      ? {
          balance: voted.balance,
          vote: voted.vote.toHuman(),
        }
      : null;
    return {
      title: callData ? `${callData.section}.${callData.method}` : null,
      content: callData ? (callData.meta ? callData.meta.documentation.join(" ") : null) : null,
      imageHash: imageHash.toHuman(),
      changes,
      userVoted,
    };
  });
  return { referendums, details };
};

const fetchCouncilVotes = async () => {
  const councilVotes = await this.api.derive.council.votes();
  return councilVotes.reduce((result, [voter, { stake, votes }]) => {
    votes.forEach((candidate) => {
      const address = candidate.toString();
      if (!result[address]) {
        result[address] = {};
      }
      result[address][voter] = stake;
    });
    return result;
  }, {});
};

const fetchProposals = async () => {
  isKeyringReady();
  isApiReady();

  let results = await this.api.derive.democracy.proposals(); 
  
  //console.log("proposals:", JSON.stringify(results));

  let converted = [];
  results.forEach(item => {
    converted.push({
      balance: convertBN(item.balance),
      index: item.index.toString(),
      proposer: item.proposer.toString(),
      hash: item.imageHash.toString(),
      call: item.image ? _transfromProposalMeta(item.image.proposal) : {}  
    })
  });

  return converted;
};

const fetchAllProposals = async () => {
  isKeyringReady();
  isApiReady();

  let pending = await fetchProposals();

  pending = pending.map(item => {
    return {
      index: item.index.toString(),
      hash: item.hash
    };
  });

  let referendums = await fetchReferendums();
  referendums = referendums.referendums;
  let referendum = {};
  if (!!referendums && referendums.length > 0) {
    referendum = {
      index: referendums[0].index.toString(),
      hash: referendums[0].imageHash.toString(),
      vote_end: Number(referendums[0].status.end.toString()),
      execution: Number(referendums[0].status.end.toString()) + Number(referendums[0].status.delay.toString())
    };
  }

  return {
    pending,
    referendum
  };
  
};

const vote = async (account, id, isYes, amount, conviction) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'democracy',
    call: 'vote',
    pubKey: account,
  };

  let vote = {
    Standard: {
      balance: convertBalance(amount),
      vote: {
        aye: isYes,
        conviction
      }
    }
  };

  const result = await sendTx(txInfo, [id, vote]);
  console.log("vote:", result);
  return result;
};

const removeVote = async (account, id) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'democracy',
    call: 'removeVote',
    pubKey: account,
  };

  const result = await sendTx(txInfo, [id]);
  console.log("removeVote:", result);
  return result;
};

const _transfromProposalMeta = (proposal) => {
  const meta = this.api.registry.findMetaCall(proposal.callIndex).toJSON();
  let doc = "";
  for (let i = 0; i < meta.documentation.length; i++) {
    if (meta.documentation[i].length) {
      doc += meta.documentation[i];
    } else {
      break;
    }
  }
  meta.documentation = doc;
  const json = proposal.toHuman();
  if (json.method == "setCode") {
    const args = json.args;
    json.args = [args[0].slice(0, 16) + "..." + args[0].slice(args[0].length - 16)];
  }
  return {
    ...json,
    meta,
  };
};

function _extractMetaData(value) {
  const params = GenericCall.filterOrigin(value).map(({ name, type }) => ({
    name: name.toString(),
    type: getTypeDef(type.toString()),
  }));
  const values = value.args.map((value) => ({
    isValid: true,
    value,
  }));
  const hash = value.hash;
  return { hash, params, values };
}

const queryBlockHeight = async () => {
  isApiReady();
  let result = await this.api.derive.chain.bestNumber();
  return result.toString();
};

const DAY_SECS = new BN(1000 * 60 * 60 * 24);
const getAccountRewardsEraOptions = async () => {
  isApiReady();

  const [eraLength, historyDepth] = await Promise.all([
    this.api.derive.session.eraLength(),
    this.api.query.staking.historyDepth(),
  ]);

  if (eraLength && historyDepth) {
    const blocksPerDay = DAY_SECS.div(
      this.api.consts.babe.expectedBlockTime ||
        this.api.consts.timestamp.minimumPeriod.muln(2) ||
        new BN(6000)
    );
    const maxBlocks = eraLength.mul(historyDepth);
    const eraSelection = [];
    let days = 2;

    while (true) {
      const dayBlocks = blocksPerDay.muln(days);

      if (dayBlocks.gte(maxBlocks)) {
        break;
      }

      eraSelection.push({
        text: days,
        unit: "day",
        value: dayBlocks.div(eraLength).toNumber(),
      });

      days = days * 3;
    }

    eraSelection.push({
      text: historyDepth.toNumber(),
      unit: "eras",
      value: historyDepth.toNumber(),
    });

    return eraSelection;
  }
  return [{ text: 0, unit: "", value: 0 }];
};

function _getRewards(stashIds, available) {
  const allRewards = {};

  stashIds.forEach((stashId, index) => {
    allRewards[stashId] = available[index].filter(
      ({ eraReward }) => !eraReward.isZero()
    );
  });

  return {
    allRewards,
    rewardCount: Object.values(allRewards).filter(
      (rewards) => rewards.length !== 0
    ).length,
  };
}

function _groupByValidator(allRewards, stakerPayoutsAfter) {
  return Object.entries(allRewards)
    .reduce((grouped, [stashId, rewards]) => {
      rewards
        .filter(({ era }) => era.gte(stakerPayoutsAfter))
        .forEach((reward) => {
          Object.entries(reward.validators).forEach(
            ([validatorId, { value }]) => {
              console.log(`validatorId:${validatorId}  value: ${value}`);
              const entry = grouped.find(
                (entry) => entry.validatorId === validatorId
              );

              if (entry) {
                const eraEntry = entry.eras.find((entry) =>
                  entry.era.eq(reward.era)
                );

                if (eraEntry) {
                  eraEntry.stashes[stashId] = value;
                } else {
                  entry.eras.push({
                    era: reward.era,
                    stashes: { [stashId]: value },
                  });
                }

                entry.available = entry.available.add(value);
              } else {
                grouped.push({
                  available: value,
                  eras: [
                    {
                      era: reward.era,
                      stashes: { [stashId]: value },
                    },
                  ],
                  validatorId,
                });
              }
            }
          );
        });

      return grouped;
    }, [])
    .sort((a, b) => b.available.cmp(a.available));
}

function _extractStashes(allRewards) {
  return Object.entries(allRewards)
    .map(([stashId, rewards]) => ({
      available: rewards.reduce(
        (result, { validators }) =>
          Object.values(validators).reduce(
            (result, { value }) => result.iadd(value),
            result
          ),
        new BN(0)
      ),
      rewards,
      stashId,
    }))
    .filter(({ available }) => !available.isZero())
    .sort((a, b) => b.available.cmp(a.available));
}

function _getAvailable(allRewards, stakerPayoutsAfter) {
  if (allRewards) {
    const stashes = _extractStashes(allRewards);
    const stashTotal = stashes.length
      ? stashes.reduce((total, { available }) => total.add(available), BN_ZERO)
      : null;

    return {
      stashTotal,
      stashes,
      validators: _groupByValidator(allRewards, stakerPayoutsAfter),
    };
  }

  return {};
}

const loadAccountRewardsData = async (stashId, maxEras) => {
  isApiReady();

  const allEras = await this.api.derive.staking.erasHistoric();
  const filteredEras = allEras.slice(-1 * maxEras);

  const stakerRewards = await this.api.derive.staking.stakerRewardsMultiEras(
    [stashId],
    filteredEras
  );

  console.log("stakerRewards", JSON.stringify(stakerRewards));

  // return stakerRewards;
  const { allRewards } = _getRewards([stashId], stakerRewards);
  const stakerPayoutsAfter = isFunction(this.api.tx.staking.payoutStakers)
    ? new BN(0)
    : new BN("1000000000");
  const res = _getAvailable(allRewards, stakerPayoutsAfter);

  return { available: res.stashTotal, validators: res.validators };
};

/**
 * 
 * @param {*} account 
 * @param {*} validators 
 * {
 *    validator,
 *    eras
 * }
 */
const payoutStakers = async (account, validators) => {
  isApiReady();
  let results = [];

  const payout = async (validator, era) => {
    const txInfo = {
      module: 'staking',
      call: 'payoutStakers',
      pubKey: account,
    };
  
    const result = await sendTx(txInfo, [validator, era]);
    console.log("payout:", result);
    return result;
  };

  for (let i = 0; i < validators.length; i++) {
    let {validator, eras} = validators[i];

    for (let j = 0; j < eras.length; j++) {
      let payoutResult = await payout(validator, eras[j]);
      results.push(payoutResult);
    }
  }
  
  return results;
};

const bondExtra = async (stash, amount) => {
  isApiReady();

  const txInfo = {
    module: 'staking',
    call: 'bondExtra',
    pubKey: stash,
  };

  const result = await sendTx(txInfo, [convertBalance(amount)]);
  console.log("bondExtra:", result);
  return result;
};

const getSlashingSpans = async (stashId) => {
  isApiReady();
  const res = await this.api.query.staking.slashingSpans(stashId);
  return res.isNone ? 0 : res.unwrap().prior.length + 1;
};

const withdrawUnbonded = async (stash) => {
  isApiReady();

  const txInfo = {
    module: 'staking',
    call: 'withdrawUnbonded',
    pubKey: stash,
  };

  let span = await getSlashingSpans(stash);

  const result = await sendTx(txInfo, [span]);
  console.log("withdrawUnbonded:", result);
  return result;
};

const unbond = async (stash, amount) => {
  isApiReady();

  const txInfo = {
    module: 'staking',
    call: 'unbond',
    pubKey: stash,
  };

  const result = await sendTx(txInfo, [convertBalance(amount)]);
  console.log("unbond:", result);
  return result;
}

const setRewardDest = async (controller, dest) => {
  isApiReady();

  const txInfo = {
    module: 'staking',
    call: 'setPayee',
    pubKey: controller,
  };

  const result = await sendTx(txInfo, [dest]);
  console.log("setRewardDest:", result);
  return result;
}

const queryAccountStatistic = async (accountId) => {
  isApiReady();

  let result = await this.api.query.kp.accountStatisticsMap(accountId);
  return {
    commodity_num: Number(result.createCommodityNum.toString())
  };
}

const queryBlockTime = async (block) => {
  isApiReady();

  let hash = await this.api.rpc.chain.getBlockHash(block);
  let time = await this.api.query.timestamp.now.at(hash);

  console.log("time:", new Date(Number(time.toString())));

  return time.toString();
}

const queryDemocracyParams = () => {
  isApiReady();

  return {
    launchPeriod: this.api.consts.democracy.launchPeriod.toString(),
    enactmentPeriod: this.api.consts.democracy.enactmentPeriod.toString(),
    votingPeriod: this.api.consts.democracy.votingPeriod.toString()
  }
}

module.exports = {
  initKeyring: initKeyring,
  initApi: initApi,
  newAccount: newAccount,
  isAccountActive: isAccountActive,
  setupAccountByJson: setupAccountByJson,
  resetAccountWithMnemonic: resetAccountWithMnemonic,
  unlock: unlock,
  lock: lock,
  sign: sign,
  signU8a: signU8a,
  verify: verify,
  hash: hash,

  getDevAdmin: getDevAdmin,
  devTransfer: devTransfer,

  // model and document interfaces:
  createDocument: createDocument,
  createComment: createComment,
  createModel: createModel,
  addModelDeposit: addModelDeposit,
  disableModel: disableModel,
  addCommodityType: addCommodityType,
  createPowerLeaderBoard: createPowerLeaderBoard,
  appFinancedUserExchangeRequest: appFinancedUserExchangeRequest,
  appFinancedUserExchangeConfirm: appFinancedUserExchangeConfirm,
  setBatchModelPeriodIncome: setBatchModelPeriodIncome,
  requestModelCycleReward: requestModelCycleReward,
  appIncomeUserExchangeRequest: appIncomeUserExchangeRequest,
  appIncomeUserExchangeConfirm: appIncomeUserExchangeConfirm,

  setModelMax: setModelMax, // needs root

  // members interface:
  membersSetAppRedeemAccount: membersSetAppRedeemAccount,
  membersOperatePlatformExpert: membersOperatePlatformExpert,
  membersAddExpertByCreator: membersAddExpertByCreator,
  membersRemoveExpertByCreator: membersRemoveExpertByCreator,
  membersAirDropNewUserBenefit: membersAirDropNewUserBenefit,
  membersAddInvestor: membersAddInvestor,
  membersRemoveInvestor: membersRemoveInvestor,
  membersStableExchange: stableExchange,
  membersStabelRedeem: stableRedeem,
  membersAddAppAdmin: membersAddAppAdmin,
  membersRemoveAppAdmin: membersRemoveAppAdmin,
  membersAddAppKey: membersAddAppKey,
  membersRemoveAppKey: membersRemoveAppKey,

  // wallet interfaces:
  // accounts:
  balancesAll: balancesAll, // get account total balance info
  balancesAllOrg: balancesAllOrg,
  transfer: transfer, // transfer from src address to target address, the caller must own src address
  // staking:

  // council:
  fetchCouncilVotes: fetchCouncilVotes, // get council votes detail

  // democracy:
  fetchReferendums: fetchReferendums, // get referendum detail
  fetchProposals: fetchProposals,
  fetchAllProposals: fetchAllProposals,

  // RPC
  rpcGetTotalPower: rpcGetTotalPower,
  rpcGetAccountPower: rpcGetAccountPower,
  rpcGetCommodityPower: rpcGetCommodityPower,
  rpcIsCommodityInBlackList: rpcIsCommodityInBlackList,
  rpcCheckAccountIsPlatformExpert: rpcCheckAccountIsPlatformExpert,
  rpcCheckAccountIsModelExpert: rpcCheckAccountIsModelExpert,
  rpcCheckAccountIsModelCreator: rpcCheckAccountIsModelCreator,
  rpcLeaderBoardLoad: rpcLeaderBoardLoad,
  rpcStakeToVote: rpcStakeToVote,
  rpcAppFinanceRecord: rpcAppFinanceRecord,
  rpcModelIncomeCurrentStage: rpcModelIncomeCurrentStage,
  getAppFinanceExchangeRecords: getAppFinanceExchangeRecords,
  getAppIncomeExchangeRecords: getAppIncomeExchangeRecords,
  rpcAppFinanceExchangeData: rpcAppFinanceExchangeData,
  rpcIsTechMemberSign: rpcIsTechMemberSign,
  rpcMiscDocumentPower: rpcMiscDocumentPower,
  rpcModelDisputeRecord: rpcModelDisputeRecord,
  rpcCommodityPowerSlashRecord: rpcCommodityPowerSlashRecord,
  rpcModelDeposit: rpcModelDeposit,
  rpcPowerRatio: rpcPowerRatio,

  // const query
  constBalanceExistentialDeposit: constBalanceExistentialDeposit,

  // democracy
  democracyPowerComplain: democracyPowerComplain,
  democracyAddApp: democracyAddApp,
  democracyAppFinanced: democracyAppFinanced,
  democracyModelDispute: democracyModelDispute,
  isPermitSubmitAppFinance: isPermitSubmitAppFinance,

  // state query
  queryKpDocuments: queryKpDocuments,
  queryAppTypes: queryAppTypes,
  queryKpModels: queryKpModels,
  queryKpDocumentPower: queryKpDocumentPower,
  queryKpComments: queryKpComments,
  queryMinerPower: queryMinerPower,
  queryAccountAttendPower: queryAccountAttendPower,
  queryLeaderBoardRecords: queryLeaderBoardRecords,
  queryRealtimeLeaderBoard: queryRealtimeLeaderBoard,
  queryAccountCommodities: queryAccountCommodities,
  queryTotalIssuance: queryTotalIssuance,
  queryAccountInfoWithBlockNum: queryAccountInfoWithBlockNum,
  queryAppFinancedUserPortion: queryAppFinancedUserPortion,
  queryApps: queryApps,
  queryAppFinancedRecords: queryAppFinancedRecords,
  queryModelCycleIncomeRewardStore: queryModelCycleIncomeRewardStore,
  queryCommodityPower: queryCommodityPower,
  queryAccountCommentStat: queryAccountCommentStat,
  accountInfo: accountInfo,
  queryBlockHeight: queryBlockHeight,
  queryAccountStatistic: queryAccountStatistic,
  queryAppAdmins: queryAppAdmins,
  queryAppKeys: queryAppKeys,
  queryCommoditySlashRecords: queryCommoditySlashRecords,
  queryModelDisputeRecords: queryModelDisputeRecords,
  queryAppData: queryAppData,
  queryAppCycleIncome: queryAppCycleIncome,
  queryTechMembers: queryTechMembers,

  sudoAppFinance: sudoAppFinance,
  sudoAddApp: sudoAddApp,

  // wallet
  bond: bond,
  bondExtra: bondExtra,
  unbond: unbond,
  setRewardDest: setRewardDest,
  fetchStakingOverview: fetchStakingOverview,
  fetchValidatorInfos: fetchValidatorInfos,
  getOwnStashInfo: getOwnStashInfo,
  nominate: nominate,
  vote: vote,
  removeVote: removeVote,
  getAccountRewardsEraOptions: getAccountRewardsEraOptions,
  loadAccountRewardsData: loadAccountRewardsData,
  payoutStakers: payoutStakers,
  withdrawUnbonded: withdrawUnbonded,

  convertBN: convertBN,
  convertBalance: convertBalance,

  paramsSign: paramsSign,
  createSignObject: createSignObject,

  queryBlockTime: queryBlockTime,
  queryDemocracyParams: queryDemocracyParams,

  queryHistoryLiquid: queryHistoryLiquid,
  queryAppCycleIncomeUserPortion: queryAppCycleIncomeUserPortion,

  test: test,
};
