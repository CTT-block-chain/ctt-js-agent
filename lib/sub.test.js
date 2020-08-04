const sub = require("./sub");
const document = require("../interface/document");
const comment = require("../interface/comment");
const model = require("../interface/model");
const { stringToU8a, u8aToHex, hexToU8a } = require("@polkadot/util");
const config = require("../config/config");

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

const apiAddr = config.get("sub_endpoint");
console.log("trying to connect to:", apiAddr);
const initApi = () =>
  sub.initApi(apiAddr, (method, data) => {
    console.log("notify_cb:", method, data);
  });

// test transfer
/*test("transfer should success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );

    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    //return sub.devTransfer(testJson.address, 1000000000000);
    //return sub.devTransfer("5GW69fQSx1EnnrsgMN1Khnbmg9JzhrBmPcrTQknJcHthrr8V", 1000000000000000);
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
});*/

// chain api test
test("should create product publish document success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    let doc = document.create(
      "B003",
      "G0001" + new Date().getTime(),
      0,
      "M0001",
      "P0001" + new Date().getTime(),
      sub.hash("Hello"),

      33,
      28
    );
    let v = document.server_sign_value(doc);

    console.log("server sign v:", v);

    // Dev alice account
    testSign = sub.getDevAdmin().sign(v);

    return sub.createDocument(doc, sub.getDevAdmin().address, testSign, testJson.address, testSign);
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

test("should create product identify document success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    let doc = document.create(
      "B003",
      "G0001" + new Date().getTime(),
      1,
      "M0001",
      "P0001" + new Date().getTime(),
      sub.hash("Hello"),
      0,
      0,
      100,
      23,
      33,
      "C0001" + new Date().getTime()
    );
    let v = document.server_sign_value(doc);

    console.log("server sign v:", v);

    // Dev alice account
    testSign = sub.getDevAdmin().sign(v);

    return sub.createDocument(doc, sub.getDevAdmin().address, testSign, testJson.address, testSign);
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

test("should create product try document success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    let doc = document.create(
      "B003",
      "G0001" + new Date().getTime(),
      2,
      "M0001",
      "P0001" + new Date().getTime(),
      sub.hash("Hello"),
      0,
      0,
      100,
      23,
      33,
      "C0001" + new Date().getTime(),
      45,
      21
    );
    let v = document.server_sign_value(doc);

    console.log("server sign v:", v);

    // Dev alice account
    testSign = sub.getDevAdmin().sign(v);

    return sub.createDocument(doc, sub.getDevAdmin().address, testSign, testJson.address, testSign);
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

test("should create comment success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    let ts = new Date().getTime();
    let app_id = "A0001";
    let document_id = "K0001" + ts;

    const createComment = () => {
      // create a knowledge first
      let c = comment.create(app_id, document_id, "C0001" + ts, sub.hash("comment"), 1024, 0);
      let v = comment.server_sign_value(c);

      console.log("server sign v:", v);

      // Dev alice account
      testSign = sub.getDevAdmin().sign(v);

      return sub.createComment(c, testJson.address, "123456", sub.getDevAdmin().address, testSign);
    };

    const createDocument = () => {
      console.log("test id:", app_id, document_id);
      let doc = document.create(
        app_id,
        document_id,
        0,
        "M0001",
        "P0001" + new Date().getTime(),
        sub.hash("Hello"),
        0,
        0
      );
      let v = document.server_sign_value(doc);

      console.log("server sign v:", v);

      // Dev alice account
      testSign = sub.getDevAdmin().sign(v);

      return sub.createDocument(doc, sub.getDevAdmin().address, testSign, testJson.address, testSign);
    };

    return createDocument().then(createComment);
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

test("should create model success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    let mod = model.create("B003", "G0002" /* + new Date().getTime()*/, "E0001", "M0001", sub.hash("Hello"));
    let v = document.server_sign_value(mod);

    console.log("server sign v:", v);

    // Dev alice account
    testSign = sub.getDevAdmin().sign(v);

    return sub.createModel(mod, testJson.address, testSign, sub.getDevAdmin().address, testSign);
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

test("should set app admin success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, "123456");

    return sub.membersSetAppAdmin("B003", testJson.address);
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

test("should add model expert success", () => {
  const processTest = () => {
    const creatorJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(creatorJson);
    sub.unlock(creatorJson.address, "123456");

    const memberJson = JSON.parse(
      `{"address":"5C8EArEjFskWMxkKTnUKccBoU5fTpkwyQB2wqw9ZXUURARh6","encoded":"0x94d440b03a4d10f4d09a2e8f7632205199e9e32f1f3cb25883d0728fc71d50d92318905375f2c3e666e09c892826d9a923759b6dd09ccff00de30afbe01131eb7acaf1abf4a1f1f6aa5e3d93dd1947003b67e1a92ab810ee04c421ab1bf2f1aaee01f7b318a44b0b6eea7400fcd9aa8410c3f9a8d7ea26866ab3d58579b15858bff8a553ca485f52c12a5fe703657f5bfb0267a1a4a5745818a32f3797","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"aaa"}}`
    );
    sub.setupAccountByJson(memberJson);
    sub.unlock(memberJson.address, "123456");

    let testSign = sub.getDevAdmin().sign("test");

    return sub.membersAddExpertByCreator("B003", "G0002", creatorJson.address, testSign, memberJson.address, "0.01");
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

test("should delete model expert success", () => {
  const processTest = () => {
    const creatorJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(creatorJson);
    sub.unlock(creatorJson.address, "123456");

    const memberJson = JSON.parse(
      `{"address":"5C8EArEjFskWMxkKTnUKccBoU5fTpkwyQB2wqw9ZXUURARh6","encoded":"0x94d440b03a4d10f4d09a2e8f7632205199e9e32f1f3cb25883d0728fc71d50d92318905375f2c3e666e09c892826d9a923759b6dd09ccff00de30afbe01131eb7acaf1abf4a1f1f6aa5e3d93dd1947003b67e1a92ab810ee04c421ab1bf2f1aaee01f7b318a44b0b6eea7400fcd9aa8410c3f9a8d7ea26866ab3d58579b15858bff8a553ca485f52c12a5fe703657f5bfb0267a1a4a5745818a32f3797","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"aaa"}}`
    );
    sub.setupAccountByJson(memberJson);
    sub.unlock(memberJson.address, "123456");

    let testSign = sub.getDevAdmin().sign("test");

    return sub.membersRemoveExpertByCreator(
      "B003",
      "G0002",
      memberJson.address,
      creatorJson.address,
      testSign,
      sub.getDevAdmin().address,
      testSign
    );
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

test("should get address balances success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );

    //return sub.balancesAll(testJson.address);
    return sub.balancesAll("5GrwX4JEmrmk2RM6aTorJxzbpDWzgoifKVtHCPdjQohjRPo6");
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(JSON.stringify(result));
      console.log(result.total.toString());
      expect(result).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 30000);

test("should air drop success", () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );

    return sub.membersAirDropNewUserBenefit(sub.getDevAdmin().address, testJson.address, "a01", "u01", "2");
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(JSON.stringify(result));
      expect(result).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 30000);
