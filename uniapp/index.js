const Sub = require("../lib/sub");

window.subInitKeyring = () => Sub.initKeyring();
window.subInitApi = (node) => Sub.initApi(node);
window.subNewAccount = (name, pwd) => Sub.newAccount(name, pwd);
window.subSetupAccountByJson = (json) => Sub.setupAccountByJson(json);
window.subUnlock = (address, pwd) => Sub.unlock(address, pwd);
window.subLock = (address) => Sub.lock(address);
window.subSign = (address, msg) => Sub.sign(address, msg);
window.subVerify = (address, msg, sign) => (Sub.verify(address, msg, sign).isValid ? true : false);
window.subHash = (msg) => Sub.hash(msg);

window.walletBalanceAll = (address) => Sub.balancesAll(address);
window.walletTransfer = (srcAddress, destAddress, amount, password) =>
  Sub.transfer(srcAddress, destAddress, amount, password);

window.walletFetchCouncilVotes = () => Sub.fetchCouncilVotes();
window.walletFetchReferendums = () => Sub.fetchCouncilVotes();
