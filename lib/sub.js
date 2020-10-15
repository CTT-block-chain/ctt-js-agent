// Required imports
const fs = require('fs');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
const { blake2AsHex, mnemonicGenerate, cryptoWaitReady, signatureVerify } = require('@polkadot/util-crypto');

const { BN } = require('bn.js');

const DEC_NUM = 14; // TODO: should be 12

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

const initKeyring = async () => {
  await cryptoWaitReady();
  // create keyring
  this.keyring = new Keyring({ type: 'sr25519' });

  // just for dev
  this.alice = this.keyring.addFromUri('//Alice', { name: 'Alice default' });

  const json = this.alice.toJson();
  console.log('alice:', JSON.stringify(json));

  //console.log("alice address:", hexToU8a(this.alice.address));

  this.isKeyringReady = true;
};

const getDevAdmin = () => this.alice;

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

  ModelStatus: {
    _enum: ['ENABLED', 'DISABLED'],
  },

  DocumentType: {
    _enum: ['ProductPublish', 'ProductIdentify', 'ProductTry', 'ProductChoose', 'ModelCreate', 'Unknown'],
  },

  CommentTrend: {
    _enum: ['Positive', 'Negative', 'Empty'],
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
};

const rpc = {
  kP: {
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

  console.log('api:', this.api.rpc);

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

const verify = (address, msg, sign) => {
  isKeyringReady();
  console.log('subVerify:', address, msg, sign);
  return signatureVerify(msg, sign, address);
};

const hash = (msg) => blake2AsHex(msg);

const _extractEvents = (result) => {
  if (!result || !result.events) {
    return;
  }

  let success = false;
  let error;
  result.events
    .filter((event) => !!event.event)
    .map(({ event: { data, method, section } }) => {
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
        if (this.notify_cb) {
          this.notify_cb('txUpdateEvent', {
            //title: `${section}.${method}`,
            section,
            method,
            message,
          });
        }
        error = message;
      } else {
        if (this.notify_cb) {
          this.notify_cb('txUpdateEvent', {
            section,
            method,
            message: 'ok',
          });
        }
        if (section == 'system' && method == 'ExtrinsicSuccess') {
          success = true;
        }
      }
    });
  return { success, error };
};

const sendTx = (txInfo, paramList, isSudo) => {
  return new Promise((resolve) => {
    console.log('sendTx params:', paramList);
    let tx = this.api.tx[txInfo.module][txInfo.call](...paramList);

    if (isSudo) {
      tx = this.api.tx.sudo.sudo(tx);
    }

    let unsub = () => {};
    const onStatusChange = (result) => {
      if (result.status.isInBlock || result.status.isFinalized) {
        const { success, error } = _extractEvents(result);
        if (success) {
          resolve({ hash: tx.hash.hash.toHuman() });
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

const convertBalance = (num) => {
  let sep = num.split('.');
  let int = sep[0];
  let dec = sep[1];

  if (!dec) {
    dec = '0';
  }

  let decLen = Math.min(DEC_NUM, dec.length);
  let convert = new BN(int, 10)
    .mul(new BN(Math.pow(10, DEC_NUM), 10))
    .add(new BN(dec, 10).mul(new BN(Math.pow(10, DEC_NUM - decLen))));

  console.log('convertBalance:', convert.toString());

  return convert;
};

const devTransfer = async (target, num) => {
  isKeyringReady();
  isApiReady();
  //const txHash = await this.api.tx.balances.transfer(target, num).signAndSend(this.alice);

  const txInfo = {
    module: 'balances',
    call: 'transfer',
    pubKey: this.alice.address,
  };

  // expect num is a float string rep, like "3.564"
  let convert = convertBalance(num);

  const result = await sendTx(txInfo, [target, convert]);
  console.log('transfer result:', result);

  return result;
};

// Chain api interfaces:
const createDocument = async (document, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  isKeyringReady();
  isApiReady();

  let { app_id, document_id, document_type, product_id, model_id, content_hash } = document;
  app_id = Number(app_id);
  let specificData = {};
  let createApi;

  let txInfo = {
    module: 'kp',
    pubKey: sender_pub_key,
  };

  switch (document_type) {
    case 0:
      {
        // product publish
        const { para_issue_rate: paraIssueRate, self_issue_rate: selfIssueRate } = document;
        specificData = { paraIssueRate, selfIssueRate };
        txInfo.call = 'createProductPublishDocument';
      }
      break;
    case 1:
      // product identify
      {
        const {
          goods_price: goodsPrice,
          ident_rate: identRate,
          ident_consistence: identConsistence,
          cart_id: cartId,
        } = document;
        specificData = { goodsPrice, identRate, identConsistence, cartId };
        txInfo.call = 'createProductIdentifyDocument';
      }
      break;
    case 2:
      // product try
      {
        const { goods_price: goodsPrice, offset_rate: offsetRate, true_rate: trueRate, cart_id: cartId } = document;
        specificData = { goodsPrice, offsetRate, trueRate, cartId };
        txInfo.call = 'createProductTryDocument';
      }
      break;
    case 3:
      // product choose
      {
        const { sell_count: sellCount, try_count: tryCount } = document;
        specificData = { sellCount, tryCount };
        txInfo.call = 'createProductChooseDocument';
      }
      break;
    case 4:
      // model create
      {
        const { producer_count: producerCount, product_count: productCount } = document;
        specificData = { producerCount, productCount };
        txInfo.call = 'createModelCreateDocument';
      }
      break;
    default:
      console.error('document type error:', document.document_type);
      return;
  }

  console.log('specific data:', specificData);
  console.log(`app id:${app_id} document id ${document_id}`);

  // create, sign and send transaction
  params = [
    app_id,
    document_id,
    model_id,
    product_id,
    content_hash,

    specificData,

    owner_pub_key,
    owner_sign,

    sender_pub_key,
    sender_sign,
  ];

  const result = await sendTx(txInfo, params);
  console.log('createDocument result:', result);
  return result;
};

const createComment = async (comment, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  let { app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend } = comment;
  app_id = Number(app_id);

  let txInfo = {
    module: 'kp',
    call: 'createComment',
    pubKey: sender_pub_key,
  };

  params = [
    app_id,
    comment_id,
    document_id,

    comment_hash,
    comment_fee,
    comment_trend,

    owner_pub_key,
    owner_sign,

    sender_pub_key,
    sender_sign,
  ];

  const result = await sendTx(txInfo, params);
  console.log('createComment result:', result);
  return result;
};

const createModel = async (model, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  let { app_id, model_id, expert_id, commodity_name, commodity_type, content_hash } = model;
  app_id = Number(app_id);

  let txInfo = {
    module: 'kp',
    call: 'createModel',
    pubKey: sender_pub_key,
  };

  params = [
    app_id,
    model_id,
    expert_id,

    commodity_name,
    commodity_type,
    content_hash,

    owner_pub_key,
    owner_sign,

    sender_pub_key,
    sender_sign,
  ];

  const result = await sendTx(txInfo, params);
  console.log('createModel result:', result);
  return result;
};

const disableModel = async (model, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  let { app_id, model_id } = model;
  app_id = Number(app_id);

  let txInfo = {
    module: 'kp',
    call: 'disableModel',
    pubKey: sender_pub_key,
  };

  params = [app_id, model_id, owner_pub_key, owner_sign, sender_pub_key, sender_sign];
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
 * @param {*} app_id
 * @param {*} modle_id
 * @param {*} model_creator 模型创建者公钥
 * @param {*} model_creator_sign 模型创建者签名（签名内容为new_member_pub_key + kpt_profit_rate）
 * @param {*} new_member_pub_key 新增成员公钥
 * @param {*} kpt_profit_rate 每年模型增发kpt分成比例 浮点字符串小数点后至多4位 ("0.0000" - "1")
 */
const membersAddExpertByCreator = async (
  app_id,
  modle_id,
  model_creator,
  model_creator_sign,
  new_member_pub_key,
  kpt_profit_rate
) => {
  //const keyPair = this.keyring.getPair(new_member_pub_key);
  app_id = Number(app_id);
  kpt_profit_rate = Math.round(Number(kpt_profit_rate) * 10000);

  let txInfo = {
    module: 'members',
    call: 'addExpertMember',
    pubKey: new_member_pub_key,
  };

  const result = await sendTx(txInfo, [app_id, modle_id, kpt_profit_rate, model_creator, model_creator_sign]);
  console.log('membersAddExpertByCreator result:', result);
  return result;
};

/**
 * 删除模型专家组成员
 * @param {*} app_id
 * @param {*} modle_id
 * @param {*} old_member_pub_key 待删除成员公钥
 * @param {*} model_creator 模型创建者公钥
 * @param {*} model_creator_sign 模型创建者签名（签名内容为old_member_pub_key）
 * @param {*} sender_pub_key 发送服务端公钥
 * @param {*} sender_sign 发送服务端签名（签名内容为model_creator_sign)
 */
const membersRemoveExpertByCreator = async (
  app_id,
  modle_id,
  old_member_pub_key,
  model_creator,
  model_creator_sign,
  sender_pub_key,
  sender_sign
) => {
  app_id = Number(app_id);
  let txInfo = {
    module: 'members',
    call: 'removeExpertMember',
    pubKey: sender_pub_key,
  };

  params = [old_member_pub_key, app_id, modle_id, model_creator, model_creator_sign, sender_pub_key, sender_sign];

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

const membersAddDeveloper = async (developer) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'members',
    call: 'addDeveloperMember',
    pubKey: getDevAdmin().address,
  };

  const result = await sendTx(txInfo, [developer], true);
  console.log('membersAddDeveloper result:', result);

  return result;
};

const membersRemoveDeveloper = async (developer) => {
  isKeyringReady();
  isApiReady();

  const txInfo = {
    module: 'members',
    call: 'removeDeveloperMember',
    pubKey: getDevAdmin().address,
  };

  const result = await sendTx(txInfo, [investor], true);
  console.log('membersRemoveDeveloper result:', result);

  return result;
};

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
const balancesAll = async (address) => {
  const {
    votingBalance: total,
    reservedBalance: reserved,
    lockedBalance: locked,
    frozenFee: bonded,
    availableBalance: transferable,
    freeBalance: free,
    lockedBreakdown: lockDetails, // [{amount, reasons, use}]
  } = await this.api.derive.balances.all(address);

  return {
    total: convertBN(total),
    reserved: convertBN(reserved),
    locked: convertBN(locked),
    bonded: convertBN(bonded),
    transferable: convertBN(transferable),
    free: convertBN(free),
    lockDetails,
  };
};

const fetchReferendums = async (address) => {
  const referendums = await api.derive.democracy.referendums();
  const sqrtElectorate = await api.derive.democracy.sqrtElectorate();
  const details = referendums.map(({ image, status, votedAye, votedNay, votedTotal, votes }) => {
    if (!image.proposal) {
      return {};
    }
    const callData = api.registry.findMetaCall(image.proposal.callIndex);
    const parsedMeta = _extractMetaData(callData.meta);
    image.proposal = image.proposal.toHuman();
    if (image.proposal.method == 'setCode') {
      const args = image.proposal.args;
      image.proposal.args = [args[0].slice(0, 16) + '...' + args[0].slice(args[0].length - 16)];
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
      title: `${callData.section}.${callData.method}`,
      content: callData.meta ? callData.meta.documentation.join(' ') : ' ',
      changes: {
        changeAye: changes.changeAye.toString(),
        changeNay: changes.changeNay.toString(),
      },
      userVoted,
      ...parsedMeta,
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

const txFeeEstimate = async (txInfo, paramList) => {
  const dispatchInfo = await this.api.tx[txInfo.module][txInfo.call](...paramList).paymentInfo(txInfo.address);
  console.log('txFeeEstimate:', dispatchInfo);
  return dispatchInfo;
};

// below are rpc interfaces:
const rpcGetTotalPower = async () => {
  console.log(this.api.rpc);
  let pw = await this.api.rpc.kP.totalPower();
  return Number(pw);
};

const rpcGetAccountPower = async (accountId) => {
  console.log(this.api.rpc);
  let pw = await this.api.rpc.kP.accountPower(accountId);
  return Number(pw);
};

const rpcGetCommodityPower = async (appId, cartIds) => {
  appId = Number(appId);
  let queue = [];

  const querySingle = (cartId) =>
    this.api.rpc.kP.isCommodityPowerExist({ appId, cartId }).then((isExist) => {
      console.log('isCommodityPowerExist:', cartId, isExist.toHuman());
      if (isExist.toHuman()) {
        return this.api.rpc.kP.commodityPower({ appId, cartId }).then((power) => {
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

// chain constant api
const constBalanceExistentialDeposit = () => {
  let v = this.api.consts.balances.existentialDeposit;
  console.log('ExistentialDeposit:', v.toString());

  return convertBN(v);
};

// democracy
const createPreImage = (txModule, method, paramList) => {
  let tx = this.api.tx[txModule][method](...paramList);
  // console.log('createPreImage:', tx);
  return blake2AsHex(tx.method.toHex());
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

  let imageHash = createPreImage('kp', 'democracySlashCommodityPower', [app_id, cart_id, comment_id, sender_pub_key]);
  console.log('imageHash:', imageHash);

  // submit purposol
  const txInfo = {
    module: 'democracy',
    call: 'propose',
    pubKey: sender_pub_key,
  };

  deposit = getDeposit(deposit);
  const result = await sendTx(txInfo, [imageHash, deposit], false);
  console.log('democracyPowerComplain result:', result);

  return result;
};

const democracyAddApp = async (appAdd, sender_pub_key, deposit) => {
  isKeyringReady();
  isApiReady();

  let { app_name, app_type, identity_key, admin_key, return_rate } = appAdd;

  // TODO: check owner_pub_key is tech member
  let imageHash = createPreImage('kp', 'democracyAddApp', [app_type, app_name, identity_key, admin_key, return_rate]);
  console.log('imageHash:', imageHash);

  // submit purposol
  const txInfo = {
    module: 'democracy',
    call: 'propose',
    pubKey: sender_pub_key,
  };

  deposit = getDeposit(deposit);
  const result = await sendTx(txInfo, [imageHash, deposit], false);
  console.log('democracyAddApp result:', result);

  return result;
};

const democracyAppFinanced = async (appId, kptAmount, exchangeRate, sender_pub_key, deposit) => {
  isKeyringReady();
  isApiReady();

  let imageHash = createPreImage('kp', 'democracyAppFinanced', [
    Number(appId),
    convertBalance(kptAmount),
    convertBalance(exchangeRate),
  ]);
  console.log('imageHash:', imageHash);

  // submit purposol
  const txInfo = {
    module: 'democracy',
    call: 'propose',
    pubKey: sender_pub_key,
  };

  deposit = getDeposit(deposit);
  const result = await sendTx(txInfo, [imageHash, deposit], false);
  console.log('democracyAppFinanced result:', result);

  return result;
};

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
  verify: verify,
  hash: hash,

  getDevAdmin: getDevAdmin,
  devTransfer: devTransfer,

  // model and document interfaces:
  createDocument: createDocument,
  createComment: createComment,
  createModel: createModel,
  disableModel: disableModel,
  addCommodityType: addCommodityType,

  setModelMax: setModelMax, // needs root

  // members inteface:
  membersSetAppAdmin: membersSetAppAdmin,
  membersOperatePlatformExpert: membersOperatePlatformExpert,
  membersAddExpertByCreator: membersAddExpertByCreator,
  membersRemoveExpertByCreator: membersRemoveExpertByCreator,
  membersAirDropNewUserBenefit: membersAirDropNewUserBenefit,
  membersAddInvestor: membersAddInvestor,
  membersRemoveInvestor: membersRemoveInvestor,
  membersAddDeveloper: membersAddDeveloper,
  membersRemoveDeveloper: membersRemoveDeveloper,
  membersStableExchange: stableExchange,

  // wallet interfaces:
  // accounts:
  balancesAll: balancesAll, // get account total balance info
  transfer: transfer, // transfer from src address to target address, the caller must own src address
  // staking:

  // council:
  fetchCouncilVotes: fetchCouncilVotes, // get council votes detail

  // democracy:
  fetchReferendums: fetchReferendums, // get referendum detail

  // RPC
  rpcGetTotalPower: rpcGetTotalPower,
  rpcGetAccountPower: rpcGetAccountPower,
  rpcGetCommodityPower: rpcGetCommodityPower,
  rpcCheckAccountIsPlatformExpert: rpcCheckAccountIsPlatformExpert,
  rpcCheckAccountIsModelExpert: rpcCheckAccountIsModelExpert,
  rpcCheckAccountIsModelCreator: rpcCheckAccountIsModelCreator,

  // const query
  constBalanceExistentialDeposit: constBalanceExistentialDeposit,

  // democracy
  democracyPowerComplain: democracyPowerComplain,
  democracyAddApp: democracyAddApp,
  democracyAppFinanced: democracyAppFinanced,

  // state query
  queryKpDocuments: queryKpDocuments,
  queryAppTypes: queryAppTypes,
  queryKpModels: queryKpModels,
  queryKpDocumentPower: queryKpDocumentPower,
  queryKpComments: queryKpComments,
  queryMinerPower: queryMinerPower,
  queryAccountAttendPower: queryAccountAttendPower,
};
