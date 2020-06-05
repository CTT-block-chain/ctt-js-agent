const sub = require("./sub");
const knowledge = require("../interface/knowledge");
const comment = require("../interface/comment");
const { stringToU8a, u8aToHex, hexToU8a } = require("@polkadot/util");

test("create account should success", () => {
  return sub.initKeyring().then(() => {
    const account = sub.newAccount("test", "123456");
    expect(account.json).toBeDefined();
  });
});

test("load account by json should success", () => {
  return sub.initKeyring().then(() => {
    const testJson = `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`;
    sub.setupAccountByJson(JSON.parse(testJson));
    // no exception happens means passed
    expect(true).toBe(true);
  });
});

test("load account should be locked state", () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    try {
      const sign = sub.sign(testJson.address, "hello");
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});

test("with correct password should unlock account success", () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");
    const sign = sub.sign(testJson.address, "hello");
    expect(sign).toBeDefined();
  });
});

test("with wrong password should unlock account fail", () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);

    try {
      sub.unlock(testJson.address, "1234567");
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});

test("lock account should success", () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");
    sub.lock(testJson.address);

    try {
      const sign = sub.sign(testJson.address, "hello");
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});

test("lock account then unlock should success", () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.lock(testJson.address);
    sub.unlock(testJson.address, "123456");

    const sign = sub.sign(testJson.address, "hello");
    expect(sign).toBeDefined();
  });
});

test("sign message should success", () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");
    const sign = sub.sign(testJson.address, "hello");
    expect(sign).toBeDefined();
  });
});

test("verify sign should success", () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");
    const sign = sub.sign(testJson.address, "hello");
    const verify = sub.verify(testJson.address, "hello", sign);
    expect(verify.isValid).toBe(true);
  });
});

test("hash message should success", () => {
  const hash = sub.hash("hello");
  expect(hash).toBeDefined();
});

const initKeyring = () => sub.initKeyring();
const initApi = () => sub.initApi("ws://localhost:9944");

// test transfer
test("transfer should success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );

    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    return sub.devTransfer(testJson.address, 1000000000000);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
    })
    .catch((e) => {
      console.error(e);
    });
});

// chain api test
test("should create knowledge success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    let k = knowledge.create(
      "A002",
      "K0001" + new Date().getTime(),
      0,
      "M0001",
      "P0001",
      sub.hash("Hello"),
      80,
      "",
      sub.hash("memo")
    );
    let v = knowledge.server_sign_value(k);

    console.log("server sign v:", v);

    // Dev alice account
    testSign = sub.getDevAdmin().sign(v);

    return sub.createKnowledge(testJson.address, "123456", k, sub.getDevAdmin().address, testSign);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.data).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 30000);

test("should create comment success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    let ts = new Date().getTime();
    let app_id = "A0001";
    let knowledge_id = "K0001" + ts;

    const createComment = () => {
      // create a knowledge first
      let c = comment.create(app_id, knowledge_id, "C0001" + ts, "LC0001", sub.hash("comment"), 1024, 512);
      let v = comment.server_sign_value(c);

      console.log("server sign v:", v);

      // Dev alice account
      testSign = sub.getDevAdmin().sign(v);

      return sub.createComment(testJson.address, "123456", c, sub.getDevAdmin().address, testSign);
    };

    const createKnowledge = () => {
      console.log("test id:", app_id, knowledge_id);
      let k = knowledge.create(app_id, knowledge_id, 0, "M0001", "P0001", sub.hash("Hello"), 80, "", sub.hash("memo"));
      let v = knowledge.server_sign_value(k);

      console.log("server sign v:", v);

      // Dev alice account
      testSign = sub.getDevAdmin().sign(v);

      return sub.createKnowledge(testJson.address, "123456", k, sub.getDevAdmin().address, testSign);
    };

    return createKnowledge().then(createComment);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.data).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);
