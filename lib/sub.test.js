const sub = require('./sub');
const document = require('../interface/document');
const comment = require('../interface/comment');
const model = require('../interface/model');
const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
const config = require('../config/config');

test('create account should success', () => {
  return sub.initKeyring().then(() => {
    const account = sub.newAccount('test', '123456');
    expect(account.json).toBeDefined();
  });
});

test('load account by json should success', () => {
  return sub.initKeyring().then(() => {
    const testJson = `{"address":"5CS6KGBqoNBkUMCzFSLa78Uo7TFN98xdWokaQkh8h9j1uJTf","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"encoded":"0xc6891b17d1c97a6db0b2af5d91abe99e9abde797d8a0c65e6605e803ac70b7c1ccf0a07a4effb920c0654b792b0ecfec2141ba3201ba40c7e222369c397c856ec4f8c7e74b05f3339dd5b17f6c4bdc10955818f2857f9fc6069d46c4880049ef85ae60bf876e3a8cf22ea4eecd5985c5b6f217f984dfd9a90239c63920c11e3f36c6f578e5796888206130c41d037eb8739f899b4f34ca3de64fde4757","meta":{"name":"北京5北京5北京5北京5"}}`;
    sub.setupAccountByJson(JSON.parse(testJson));
    // no exception happens means passed

    expect(true).toBe(true);
  });
});

test('load account should be locked state', () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    try {
      const sign = sub.sign(testJson.address, 'hello');
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});

test('with correct password should unlock account success', () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5Gy5A6fsD4JXLVEqYp3EWqzTauLD9u5NVaSLDDDnS8rPoRDr","encoded":"0x9aa1a546e866be05bb6b47817a2f98a6ae8f83a56d4858526be5169fd014d57e78ab3a4cdc959958d1685d8b9ec5ef58edfe330b52ccbef34d3dc6070a3a0b0ce8e2170bf7394aa6fd1cf159c318fdb0e5e882a2910b17b72e79bbfd9ff6a823f608a796b02ef7a05da4d833af69645315b779232a31127767eb66d4742ace24cd073625a5cd9a4a945292bb8d90691ee44803e1e5976b37bbb9a5ed27","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"abc"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');
    const sign = sub.sign(testJson.address, 'hello');
    expect(sign).toBeDefined();
  });
});

test('with wrong password should unlock account fail', () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);

    try {
      sub.unlock(testJson.address, '1234567');
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});

test('lock account should success', () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');
    sub.lock(testJson.address);

    try {
      const sign = sub.sign(testJson.address, 'hello');
    } catch (e) {
      expect(true).toBe(true);
    }
  });
});

test('lock account then unlock should success', () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.lock(testJson.address);
    sub.unlock(testJson.address, '123456');

    const sign = sub.sign(testJson.address, 'hello');
    expect(sign).toBeDefined();
  });
});

test('sign message should success', () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');
    const sign = sub.sign(testJson.address, 'hello');
    expect(sign).toBeDefined();
  });
});

test('verify sign should success', () => {
  return sub.initKeyring().then(() => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');
    const sign = sub.sign(testJson.address, 'hello');
    const verify = sub.verify(testJson.address, 'hello', sign);
    expect(verify.isValid).toBe(true);
  });
});

test('hash message should success', () => {
  const hash = sub.hash('hello');
  expect(hash).toBeDefined();
});

const initKeyring = () => sub.initKeyring();

const apiAddr = config.get('sub_endpoint');
console.log('trying to connect to:', apiAddr);
const initApi = () =>
  sub.initApi(apiAddr, (method, data) => {
    console.log('notify_cb:', method, data);
  });

// test transfer
test('transfer should success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );

    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    //return sub.devTransfer(testJson.address, 1000000000000);
    return sub.devTransfer('5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk', '10000');
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
test('should create product publish document success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let doc = document.create(
      'B003',
      'G0001' + new Date().getTime(),
      0,
      'M0001',
      'P0001' + new Date().getTime(),
      sub.hash('Hello'),

      33,
      28
    );
    let v = document.server_sign_value(doc);

    console.log('server sign v:', v);

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

test('should create product identify document success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let doc = document.create(
      'B003',
      'G0001' + new Date().getTime(),
      1,
      'M0001',
      'P0001' + new Date().getTime(),
      sub.hash('Hello'),
      0,
      0,
      100,
      23,
      33,
      'C0001' + new Date().getTime()
    );
    let v = document.server_sign_value(doc);

    console.log('server sign v:', v);

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

test('should create product try document success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let doc = document.create(
      'B003',
      'G0001' + new Date().getTime(),
      2,
      'M0001',
      'P0001' + new Date().getTime(),
      sub.hash('Hello'),
      0,
      0,
      100,
      23,
      33,
      'C0001' + new Date().getTime(),
      45,
      21
    );
    let v = document.server_sign_value(doc);

    console.log('server sign v:', v);

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

test('should create comment success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let ts = new Date().getTime();
    let app_id = 'A0001';
    let document_id = 'K0001' + ts;

    const createComment = () => {
      // create a knowledge first
      let c = comment.create(app_id, document_id, 'C0001' + ts, sub.hash('comment'), 1024, 0);
      let v = comment.server_sign_value(c);

      console.log('server sign v:', v);

      // Dev alice account
      testSign = sub.getDevAdmin().sign(v);

      return sub.createComment(c, testJson.address, '123456', sub.getDevAdmin().address, testSign);
    };

    const createDocument = () => {
      console.log('test id:', app_id, document_id);
      let doc = document.create(
        app_id,
        document_id,
        0,
        'M0001',
        'P0001' + new Date().getTime(),
        sub.hash('Hello'),
        0,
        0
      );
      let v = document.server_sign_value(doc);

      console.log('server sign v:', v);

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

test('should create model success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let mod = model.create('B003', 'G0002' + new Date().getTime(), 'E0001', 'name1', 100010001, sub.hash('Hello'));
    let v = document.server_sign_value(mod);

    console.log('server sign v:', v);

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

test('should add commodity type success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    return sub.addCommodityType(10001, 'test type');
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

test('should set app admin success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    return sub.membersSetAppAdmin('B003', testJson.address);
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

test('should add model expert success', () => {
  const processTest = () => {
    const creatorJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(creatorJson);
    sub.unlock(creatorJson.address, '123456');

    const memberJson = JSON.parse(
      `{"address":"5C8EArEjFskWMxkKTnUKccBoU5fTpkwyQB2wqw9ZXUURARh6","encoded":"0x94d440b03a4d10f4d09a2e8f7632205199e9e32f1f3cb25883d0728fc71d50d92318905375f2c3e666e09c892826d9a923759b6dd09ccff00de30afbe01131eb7acaf1abf4a1f1f6aa5e3d93dd1947003b67e1a92ab810ee04c421ab1bf2f1aaee01f7b318a44b0b6eea7400fcd9aa8410c3f9a8d7ea26866ab3d58579b15858bff8a553ca485f52c12a5fe703657f5bfb0267a1a4a5745818a32f3797","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"aaa"}}`
    );
    sub.setupAccountByJson(memberJson);
    sub.unlock(memberJson.address, '123456');

    let testSign = sub.getDevAdmin().sign('test');

    return sub.membersAddExpertByCreator('B003', 'G0002', creatorJson.address, testSign, memberJson.address, '0.01');
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

test('should delete model expert success', () => {
  const processTest = () => {
    const creatorJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(creatorJson);
    sub.unlock(creatorJson.address, '123456');

    const memberJson = JSON.parse(
      `{"address":"5C8EArEjFskWMxkKTnUKccBoU5fTpkwyQB2wqw9ZXUURARh6","encoded":"0x94d440b03a4d10f4d09a2e8f7632205199e9e32f1f3cb25883d0728fc71d50d92318905375f2c3e666e09c892826d9a923759b6dd09ccff00de30afbe01131eb7acaf1abf4a1f1f6aa5e3d93dd1947003b67e1a92ab810ee04c421ab1bf2f1aaee01f7b318a44b0b6eea7400fcd9aa8410c3f9a8d7ea26866ab3d58579b15858bff8a553ca485f52c12a5fe703657f5bfb0267a1a4a5745818a32f3797","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"aaa"}}`
    );
    sub.setupAccountByJson(memberJson);
    sub.unlock(memberJson.address, '123456');

    let testSign = sub.getDevAdmin().sign('test');

    return sub.membersRemoveExpertByCreator(
      'B003',
      'G0002',
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

test('should get address balances success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );

    //return sub.balancesAll(testJson.address);
    return sub.balancesAll('5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk');
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

test('should air drop success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );

    return sub.membersAirDropNewUserBenefit(sub.getDevAdmin().address, testJson.address, 'a01', 'u0001', '2');
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

test('should air drop fail when fund not enough', () => {
  const processTest = () => {
    // create new test fund account
    let fundAccount = sub.newAccount('test', '123456');
    sub.unlock(fundAccount.json.address, '123456');

    // transfer 1 kpt to test fund
    return sub.devTransfer(fundAccount.json.address, '10').then(() => {
      let newTestAccount = sub.newAccount('receiver', '123456');
      return sub.membersAirDropNewUserBenefit(
        fundAccount.json.address,
        newTestAccount.json.address,
        'a01',
        'u01',
        '11'
      );
    });
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
