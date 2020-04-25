// Required imports
const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { stringToU8a, u8aToHex, hexToU8a } = require("@polkadot/util");
const { mnemonicGenerate, blake2AsHex } = require("@polkadot/util-crypto");

const isReady = () => {
  if (!this.isReady) {
    throw new Error("api not ready");
  }
};

const init = async (wss) => {
  console.log("sub is trying to connect to node");
  this.isReady = false;

  // create keyring
  this.keyring = new Keyring({ type: "sr25519" });

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

  this.isReady = true;

  // return chain info
  return chainInfo;
};

const newAccount = (name, password) => {
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
  try {
    this.keyring.getPair(json.address);
  } catch (e) {
    // address not setup, use json
    console.log(`${json.address} not ready, reload it`);
    this.keyring.addFromJson(json);
  }
};

const unlock = (address, password) => {
  const pair = this.keyring.getPair(address);
  password = password ? password : "";
  pair.decodePkcs8(password);
  console.log(pair.isLocked);
};

const sign = (address, msg) => {
  try {
    const pair = this.keyring.getPair(address);
    return u8aToHex(pair.sign(stringToU8a(msg)));
  } catch (e) {
    console.error(`can not load address:${address} ${e}`);
  }
};

const verify = (address, msg, sign) => {
  const pair = this.keyring.getPair(address);
  return pair.verify(stringToU8a(msg), hexToU8a(sign));
};

const hash = (msg) => blake2AsHex(msg);

module.exports = {
  init: init,
  newAccount: newAccount,
  setupAccountByJson: setupAccountByJson,
  unlock: unlock,
  sign: sign,
  verify: verify,
  hash: hash,
};
