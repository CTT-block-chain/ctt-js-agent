// Required imports
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { stringToU8a, u8aToHex, hexToU8a } = require("@polkadot/util");
const {
  mnemonicGenerate,
  blake2AsHex,
  cryptoWaitReady,
  signatureVerify,
} = require("@polkadot/util-crypto");

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

  this.isKeyringReady = true;
};

const initApi = async (wss) => {
  console.log("sub is trying to connect to node");

  // create api
  this.api = await ApiPromise.create({ provider: new WsProvider(wss) });

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

module.exports = {
  initKeyring: initKeyring,
  initApi: initApi,
  newAccount: newAccount,
  setupAccountByJson: setupAccountByJson,
  unlock: unlock,
  sign: sign,
  verify: verify,
  hash: hash,
};
