const sub = require("../lib/sub");

const testJson = `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`;

const testSign =
  "0x1233d10921070f212cefe0a1e7680cbf8ec0e90b3ca4767ccdd232eb4a8c4104d59c3a7ee29fcdd7742664791ff9f9ba79f1eda6819d71715ccd513e906cb984";

//sub.init("ws://127.0.0.1:9944").then(() => {
sub.initKeyring().then(() => {
  console.log("API init done!");
  // test create account
  /*const pair = sub.newAccount("bob", "123456");
  console.log("new pair json:", JSON.stringify(pair.json), pair.mnemonic);*/

  /*const pair = sub.loadAccount(
    "5C8H6exPVPq9Vx7nGVovRHjDVC4JknsTBJbt9NKHSBbaaJPD"
  );
  console.log("load pair:", pair);*/

  const json = JSON.parse(testJson);
  console.log(json);
  sub.setupAccountByJson(json);

  sub.unlock(json.address, "123456");

  const msg = "hello";
  const test = sub.sign(json.address, msg);
  console.log("sign:", test);

  console.log("verify result:", sub.verify(json.address, msg + "0", testSign));

  //hash test
  let hash = sub.hash("hello word");
  console.log(hash);
  hash = sub.hash("hello wore");
  console.log(hash);
});
