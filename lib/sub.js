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

  AccountID32: "AccountID",

  KnowledgeBaseData: {
    content_hash: "Hash",
    extra_compute_param: "u32",
    knowledge_id: "Vec<u8>",
    knowledge_type: "u8",
    memo: "Hash",
    model_id: "Vec<u8>",
    owner: "AccountId",
    product_id: "Vec<u8>",
    tx_id: "Vec<u8>",
  },

  KnowledgeCommentData: {
    app_id: "Vec<u8>",
    knowledge_id: "Vec<u8>",
    comment_id: "Vec<u8>",
    last_comment_id: "Vec<u8>",
    comment_hash: "Hash",
    comment_fee: "u32",
    knowledge_profit: "u32",
    owner: "AccountId",
  },
};

const initApi = async (wss) => {
  console.log("sub is trying to connect to node");

  // create api
  this.api = await ApiPromise.create({ provider: new WsProvider(wss), types: chainDataTypes });

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

const devTransfer = async (target, num) => {
  isKeyringReady();
  isApiReady();
  const txHash = await this.api.tx.balances.transfer(target, num).signAndSend(this.alice);

  // Show the hash
  console.log(`Submitted with hash ${txHash}`);
};

// Chain api interfaces:
const createKnowledge = async (sender_pub_key, password, knowledge, server_pub_key, server_sign) => {
  isKeyringReady();
  isApiReady();

  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sender_pub_key);
    keyPair.decodePkcs8(password);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    const {
      app_id,
      knowledge_id,
      knowledge_type,
      product_id,
      model_id,
      content_hash,
      tx_id,
      memo_hash,
      extra_compute_ratio,
    } = knowledge;

    // create, sign and send transaction
    this.api.tx.kp
      .createKnowledge(
        app_id,
        knowledge_type,
        knowledge_id,
        product_id,
        model_id,
        content_hash,
        tx_id,
        memo_hash,
        extra_compute_ratio,
        server_pub_key,
        server_sign
      )
      .signAndSend(keyPair, ({ status, events }) => {
        if (status.isFinalized) {
          console.log(status.asFinalized.toHex());
          events.forEach(async ({ phase, event: { data, method, section } }) => {
            console.log("createKnowledge:", section.toString(), method.toString(), data.toString());
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

const createComment = async (sender_pub_key, password, comment, server_pub_key, server_sign) => {
  return new Promise(async (resolve, reject) => {
    const keyPair = this.keyring.getPair(sender_pub_key);
    keyPair.decodePkcs8(password);

    this.api.tx.system.remark(new Array());

    const { nonce, data: balance } = await this.api.query.system.account(keyPair.address);
    console.log(`balance of ${balance.free} and a nonce of ${nonce}`);

    // TODO: last_comment_id
    const { app_id, knowledge_id, comment_id, last_comment_id, comment_hash, comment_fee, knowledge_profit } = comment;
    this.api.tx.kp
      .createComment(
        app_id,
        comment_id,
        knowledge_id,
        comment_hash,
        comment_fee,
        knowledge_profit,
        server_pub_key,
        server_sign
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
  createKnowledge: createKnowledge,
  createComment: createComment,
};
