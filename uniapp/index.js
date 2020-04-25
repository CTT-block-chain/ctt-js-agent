const Sub = require("../lib/sub");

window.subInit = (node) => Sub.init(node);
window.subNewAccount = (name, pwd) => Sub.newAccount(name, pwd);
window.subSetupAccountByJson = (json) => Sub.setupAccountByJson(json);
window.subUnlock = (address, pwd) => Sub.unlock(address, pwd);
window.subSign = (address, msg) => Sub.sign(address, msg);
window.subVerify = (address, msg, sign) => Sub.verify(address, msg, sign);
window.subHash = (msg) => Sub.hash(msg);
