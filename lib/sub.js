// Required imports
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { stringToU8a, u8aToHex, hexToU8a } = require("@polkadot/util");
const { mnemonicGenerate, blake2AsHex, cryptoWaitReady, signatureVerify } = require("@polkadot/util-crypto");

const isApiReady = () => {
  if (!this.isApiReady) {
    throw new Error("api not ready");
  }
};

const isKeyringReady = () => {
  if (!this.isKeyringReady) {
    throw new Error("keyring not ready");
  }
};

const initKeyring = async () => {
  await cryptoWaitReady();
  // create keyring
  this.keyring = new Keyring({ type: "sr25519" });

  // just for dev
  this.alice = this.keyring.addFromUri("//Alice", { name: "Alice default" });

  //console.log("alice address:", hexToU8a(this.alice.address));

  this.isKeyringReady = true;
};

const getDevAdmin = () => this.alice;

const chainDataTypes = {
  // mapping the actual specified address format
  Address: "AccountId",
  // mapping the lookup
  LookupSource: "AccountId",

  AccountID32: "AccountId",

  AuthAccountId: "AccountId",

  KPProductPublishData: {
    paraIssueRate: "u32",
    selfIssueRate: "u32",
  },

  KPProductIdentifyData: {
    goodsPrice: "u32",
    identRate: "u32",
    identConsistence: "u32",
    cartId: "Vec<u8>",
  },

  KPProductTryData: {
    goodsPrice: "u32",
    offsetRate: "u32",
    trueRate: "u32",
    cartId: "Vec<u8>",
  },
};

const rpc = {
  kP: {
    totalPower: {
      description: "Get current total knowledge power.",
      params: [],
      type: "u32",
    },

    accountPower: {
      description: "Get account knowledge power.",
      params: [
        {
          name: "account",
          type: "AccountId",
        },
        {
          name: "at",
          type: "Hash",
          isOptional: true,
        },
      ],
      type: "u32",
    },
  },
};

const initApi = async (wss) => {
  console.log("sub is trying to connect to node");

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

const unlock = (address, password) => {
  isKeyringReady();
  const pair = this.keyring.getPair(address);
  password = password ? password : "";
  pair.decodePkcs8(password);
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
  return signatureVerify(msg, sign, address);
};

const hash = (msg) => blake2AsHex(msg);

const transfer = async (srcAddress, targetAddress, amount, password) => {
  isKeyringReady();
  isApiReady();
  try {
    const pair = this.keyring.getPair(srcAddress);
    pair.decodePkcs8(password);
    return this.api.tx.balances.transfer(targetAddress, amount).signAndSend(pair);
  } catch (e) {
    console.error(`transfer fail of address:${srcAddress} ${e}`);
  }
};

const devTransfer = async (target, num) => {
  isKeyringReady();
  isApiReady();
  const txHash = await this.api.tx.balances.transfer(target, num).signAndSend(this.alice);

  // Show the hash
  console.log(`Submitted with hash ${txHash}`);
};

// Chain api interfaces:
const createDocument = async (document, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  isKeyringReady();
  isApiReady();

  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sender_pub_key);
    // here we don't need to unlock, invoker should make sure the key has been unlocked
    // keyPair.decodePkcs8(password);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    const { app_id, document_id, document_type, product_id, model_id, content_hash } = document;
    let specificData = {};
    let createApi;

    switch (document_type) {
      case 0:
        {
          // product publish
          const { para_issue_rate: paraIssueRate, self_issue_rate: selfIssueRate } = document;
          specificData = { paraIssueRate, selfIssueRate };
          createApi = this.api.tx.kp.createProductPublishDocument;
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
          createApi = this.api.tx.kp.createProductIdentifyDocument;
        }
        break;
      case 2:
        // product try
        {
          const { goods_price: goodsPrice, offset_rate: offsetRate, true_rate: trueRate, cart_id: cartId } = document;
          specificData = { goodsPrice, offsetRate, trueRate, cartId };
          createApi = this.api.tx.kp.createProductTryDocument;
        }
        break;
      default:
        console.error("document type error:", document.document_type);
        return;
    }

    console.log("specific data:", specificData);
    console.log(`app id:${app_id} document id ${document_id}`);

    // create, sign and send transaction
    createApi(
      app_id,
      document_id,
      model_id,
      product_id,
      content_hash,

      specificData,

      owner_pub_key,
      owner_sign,

      sender_pub_key,
      sender_sign
    )
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("createDocument:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "kp":
                if (method === "KnowledgeCreated") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
};

const createComment = async (comment, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sender_pub_key);
    //keyPair.decodePkcs8(password);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    // TODO: last_comment_id
    const { app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend } = comment;
    this.api.tx.kp
      .createComment(
        app_id,
        comment_id,
        document_id,

        comment_hash,
        comment_fee,
        comment_trend,

        owner_pub_key,
        owner_sign,

        sender_pub_key,
        sender_sign
      )
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("createComment:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "kp":
                if (method === "CommentCreated") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
};

const createModel = async (model, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sender_pub_key);
    //keyPair.decodePkcs8(password);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    const { app_id, model_id, expert_id, commodity_name, commodity_type, content_hash } = model;
    this.api.tx.kp
      .createModel(
        app_id,
        model_id,
        expert_id,

        commodity_name,
        commodity_type,
        content_hash,

        owner_pub_key,
        owner_sign,

        sender_pub_key,
        sender_sign
      )
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("createModel:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "kp":
                if (method === "ModelCreated") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
};

const disableModel = async (model, owner_pub_key, owner_sign, sender_pub_key, sender_sign) => {
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sender_pub_key);
    //keyPair.decodePkcs8(password);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    const { app_id, model_id } = model;
    this.api.tx.kp
      .disableModel(
        app_id,
        model_id,

        owner_pub_key,
        owner_sign,

        sender_pub_key,
        sender_sign
      )
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("disableModel:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "kp":
                if (method === "ModelDisabled") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
};

// member interfaces
/**
 * 设置APP root账户，仅在SUDO启用有效
 * @param {*} app_id
 * @param {*} app_root_pub_key APP ROOT账户公钥
 * @param {*} sudo_pub_key SUDO 账户公钥，调用者需确保SUDO key已经unlock
 */
const membersSetAppAdmin = async (app_id, app_root_pub_key, sudo_pub_key) => {
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sudo_pub_key);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    this.api.members
      .setAppAdmin(app_id, app_root_pub_key)
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("setAppAdmin:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "members":
                if (method === "AppAdminSet") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
};

/**
 * 增加APP平台点评组成员
 * @param {*} app_id
 * @param {*} op_type "0": 增加, "1": 删除
 * @param {*} new_member_pub_key 新增成员公钥
 * @param {*} app_root_pub_key 调用者需要确保该KEY已经unlock, 并且该KEY是APP root 账户
 */
const membersOperatePlatformExpert = async (app_id, op_type, member_account, app_root_pub_key) => {
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(app_root_pub_key);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    let api =
      op_type === "0" ? this.api.members.addAppPlatformExpertMember : this.api.members.removeAppPlatformExpertMember;

    api(app_id, member_account)
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("addAppPlatformExpertMember:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "members":
                if (method === "MemberAdded") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
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
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(new_member_pub_key);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    kpt_profit_rate = Math.round(Number(kpt_profit_rate) * 10000);

    this.api.members
      .addExpertMember(app_id, modle_id, kpt_profit_rate, model_creator, model_creator_sign)
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("addExpertMember:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "members":
                if (method === "MemberAdded") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
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
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sender_pub_key);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    this.api.members
      .removeExpertMember(
        old_member_pub_key,
        app_id,
        modle_id,
        model_creator,
        model_creator_sign,
        sender_pub_key,
        sender_sign
      )
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("removeExpertMember:", section.toString(), method.toString(), data.toString());
            section = section.toString();
            method = method.toString();

            switch (section) {
              case "system":
                if (method === "ExtrinsicFailed") {
                  reject({
                    error: "ExtrinsicFailed",
                  });
                }
                break;
              case "members":
                if (method === "MemberRemoved") {
                  const datajson = JSON.parse(data.toString());
                  // resolve with event data
                  resolve({
                    tx: status.asFinalized.toHex(),
                    data: datajson,
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      })
      .catch((err) => {
        console.error(err);
        reject({ error: err.message });
      });
  });
};

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

  return { total, reserved, locked, bonded, transferable, free, lockDetails };
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
    if (image.proposal.method == "setCode") {
      const args = image.proposal.args;
      image.proposal.args = [args[0].slice(0, 16) + "..." + args[0].slice(args[0].length - 16)];
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
      content: callData.meta ? callData.meta.documentation.join(" ") : " ",
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

module.exports = {
  initKeyring: initKeyring,
  initApi: initApi,
  newAccount: newAccount,
  setupAccountByJson: setupAccountByJson,
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

  // members inteface:
  membersSetAppAdmin: membersSetAppAdmin,
  membersOperatePlatformExpert: membersOperatePlatformExpert,
  membersAddExpertByCreator: membersAddExpertByCreator,
  membersRemoveExpertByCreator: membersRemoveExpertByCreator,

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
};
