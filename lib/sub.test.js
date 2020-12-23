const fs = require('fs');
const { BN } = require('bn.js');
const sub = require('./sub');
const InterfaceComment = require('../interface/comment');
const InterfaceAddAppParams = require('../interface/addAppParams');
const InterfaceAppFinancedProposalParams = require('../interface/appFinancedProposalParams');
const InterfaceAppFinancedUserExchangeParams = require('../interface/appFinancedUserExchangeParams');
const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
const config = require('../config/config');

// some global defines
const APP_ID = '100010001';
const MODEL_TYPE = 100002;
const TIMESTAMP = new Date().getTime();
//const TIMESTAMP = '1';
const MODEL_ID = 'model_id_' + TIMESTAMP;
const PRODUCT_ID = 'product_id_' + TIMESTAMP;
const DOC_PUBLISH_ID = 'doc_publis_id_' + TIMESTAMP;
const DOC_IDENTIFY_ID = 'doc_identity_id_' + TIMESTAMP;
const DOC_TRY_ID = 'doc_try_id_' + TIMESTAMP;
const DOC_PRODUCT_CHOOSE_ID = 'doc_product_choose_id_' + TIMESTAMP;
const DOC_MODEL_CREATE_ID = 'doc_model_create_id_' + TIMESTAMP;
const COMMENT_ID = 'comment_id_' + TIMESTAMP;

let sudojson = fs.readFileSync("./jsonrpc/keys/sudo.json");
if (sudojson) {
  sudojson = JSON.parse(sudojson);
  console.log(sudojson);
}

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
    const sign = sub.sign(testJson.address, '0x77a911aff1ce03673bb876820fa73098b5bb654a4846aef7edf82bfaf7d6c0a6148360');
    console.log('sign:', sign);
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
    const sign = sub.sign(testJson.address, '1a6317665414590a65147bc6890baeb9df5bc022fab7389d7e1db493b66babf151039');
    console.log('sign:', sign, testJson.address);
    const verify = sub.verify(
      testJson.address,
      '1a6317665414590a65147bc6890baeb9df5bc022fab7389d7e1db493b66babf151039',
      sign
    );

    expect(verify.isValid).toBe(true);
  });
});

test('hash message should success', () => {
  const hash = sub.hash('hello');
  expect(hash).toBeDefined();
});

const initKeyring = () => sub.initKeyring(sudojson, sudojson.pwd);

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

    return sub.devTransfer(testJson.address, '200');
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
    });
}, 60000);

test('should add commodity type success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    return sub.addCommodityType(MODEL_TYPE, 'test type');
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should set app model max success', () => {
  const processTest = () => {
    return sub.setModelMax(APP_ID, 100);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
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

    let mod = model.create(APP_ID, MODEL_ID, 'E0001', 'name1', MODEL_TYPE, sub.hash('Hello'));
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
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should create model document success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let doc = document.create(
      APP_ID,
      DOC_MODEL_CREATE_ID,
      4,
      MODEL_ID,
      'P0001' + new Date().getTime(),
      sub.hash('Hello'),
      0,
      0,
      100,
      23,
      33,
      'C0001' + new Date().getTime(),
      45,
      21,
      0,
      0,
      30,
      50
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
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should create product publish document success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let doc = document.create(
      APP_ID,
      DOC_PUBLISH_ID,
      0,
      MODEL_ID,
      PRODUCT_ID,
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
      expect(result.hash).toBeDefined();
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
      APP_ID,
      DOC_IDENTIFY_ID,
      1,
      MODEL_ID,
      PRODUCT_ID,
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
      expect(result.hash).toBeDefined();
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
      APP_ID,
      DOC_TRY_ID,
      2,
      MODEL_ID,
      PRODUCT_ID,
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
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should create product choose document success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let doc = document.create(
      APP_ID,
      DOC_PRODUCT_CHOOSE_ID,
      3,
      MODEL_ID,
      PRODUCT_ID,
      sub.hash('Hello'),
      0,
      0,
      100,
      23,
      33,
      'C0001' + new Date().getTime(),
      45,
      21,
      100,
      20
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
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should create pub doc comment success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let ts = new Date().getTime();
    let app_id = APP_ID;
    let document_id = DOC_PUBLISH_ID;

    const createComment = () => {
      let c = InterfaceComment.create(app_id, document_id, 'C0001' + ts, sub.hash('comment'), "1", "0");
      let owner_sign = sub.paramsSign('CommentData', c, testJson.address);
      let auth_sign = sub.paramsSign('CommentData', c, sub.getDevAdmin().address); 
      return sub.createComment(c, testJson.address, owner_sign, sub.getDevAdmin().address, auth_sign);
    };

    return createComment();
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should create identify doc comment success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let ts = new Date().getTime();
    let app_id = APP_ID;
    let document_id = DOC_IDENTIFY_ID;

    const createComment = () => {
      let c = InterfaceComment.create(app_id, document_id, 'C0001' + ts, sub.hash('comment'), "1", "0");
      let owner_sign = sub.paramsSign('CommentData', c, testJson.address);
      let auth_sign = sub.paramsSign('CommentData', c, sub.getDevAdmin().address); 
      return sub.createComment(c, testJson.address, owner_sign, sub.getDevAdmin().address, auth_sign);
    };

    return createComment();
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should create try doc comment success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let ts = new Date().getTime();
    let app_id = APP_ID;
    let document_id = DOC_TRY_ID;

    const createComment = () => {
      let c = InterfaceComment.create(app_id, document_id, 'C0001' + ts, sub.hash('comment'), "1", "0");
      let owner_sign = sub.paramsSign('CommentData', c, testJson.address);
      let auth_sign = sub.paramsSign('CommentData', c, sub.getDevAdmin().address); 
      return sub.createComment(c, testJson.address, owner_sign, sub.getDevAdmin().address, auth_sign);
    };

    return createComment();
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
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

    return sub.membersSetAppAdmin(APP_ID, testJson.address);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should add investor member success', () => {
  const processTest = () => {
    let testAccount = sub.newAccount('abc', '123456');

    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    return sub.membersAddInvestor(testJson.address, APP_ID, testAccount.json.address);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 60000);

test('should add developer member success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    return sub.membersAddDeveloper(testJson.address);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
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

    const transfer = async () => {
      return sub.devTransfer(memberJson.address, '2');
    };

    let testSign = sub.getDevAdmin().sign('test');

    return transfer().then(() => {
      return sub.membersAddExpertByCreator(APP_ID, MODEL_ID, creatorJson.address, testSign, memberJson.address, '0.01');
    });
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      expect(result.hash).toBeDefined();
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
      APP_ID,
      MODEL_ID,
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
      expect(result.hash).toBeDefined();
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

    return sub.balancesAll(testJson.address);
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
    const testAccount = sub.newAccount('abc', '123456');

    return sub.membersAirDropNewUserBenefit(
      sub.getDevAdmin().address,
      testAccount.json.address,
      APP_ID,
      'u0001' + new Date().getTime(),
      '1'
    );
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(JSON.stringify(result));
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 30000);

test('should query app types success', () => {
  const processTest = () => {
    return sub.queryAppTypes();
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

test('should stable exchange success', () => {
  const processTest = () => {
    const testAccount = sub.newAccount('abc', '123456');

    return sub.membersStableExchange('12345678', 'abc' + TIMESTAMP, testAccount.json.address, '10', sub.getDevAdmin().address);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(JSON.stringify(result));
      expect(result.hash).toBeDefined();
    })
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 30000);


test('should query app types success', () => {
  const processTest = () => {
    return sub.queryAppTypes();
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

test('should create leader board success', () => {
  const processTest = () => {
    return sub.createPowerLeaderBoard(APP_ID, MODEL_ID);
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

test('should query leader board success', () => {
  const processTest = () => {
    return sub.rpcLeaderBoardLoad(APP_ID, MODEL_ID, 100);
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

test('should app finance success', () => {
  const processTest = () => {
    // here we use this testJson to setup app admin, add investor account
    // admin and invester share same account
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    const proposalId = "testp-" + new Date();
    const kptAmount = '100000';
    const exchange = '10000';
    const finFundAddress = '5EYCAe5ijiYfyeTn5e8qoUTDJTVY5HBXJjVN7RDe4RvCAAcU';
    const exchangeUserInitialBalance = '10000';

    let app_id;
    let finFundBalanceBefore, investorBalanceBefore;
    let finFundBalanceAfter, investorBalanceAfter;
    let appFinancedRecord;
    let exchangeUser;
    let exchangeUserPortion;

    const readFinFund = () => sub.balancesAllOrg(finFundAddress);
    const readInvestorFund = () => sub.balancesAllOrg(testJson.address);

    // prepare a new test account for user exchange, we need to prepare some initial funding for it
    const prepareExchangeUser = () => {
      exchangeUser = sub.newAccount('exchange').json;
      sub.unlock(exchangeUser.address);
      return sub.devTransfer(exchangeUser.address, exchangeUserInitialBalance);
    }

    // give some initial test balances
    const giveInvestorAccountPayFee = () => sub.devTransfer(testJson.address, '100');

    // sudo action
    const registerApp = () => {
      let params = sub.createSignObject('AddAppParams', {
        app_type: 'commodity_general',
        app_name: 'test',
        app_key: testJson.address,
        app_admin_key: testJson.address,
        return_rate: 1,
      });

      let sign = sub.paramsSign('AddAppParams', params, testJson.address);
      return sub.sudoAddApp(params, testJson.address, sign, testJson.address, sign)
        .then(data => {
          console.log("registerApp:", data);
          app_id = data.app_id
          expect(app_id).toBeDefined();
        });
    };
    
    const addInvestorAccount = () => {
      // don't care if it success
      return sub.membersAddInvestor(testJson.address, app_id, testJson.address);
    };

    const balanceBeforeAction = () => {
      return Promise.all([readFinFund(), readInvestorFund()]).then(results => {
        console.log("balanceBeforeAction:", results);
        finFundBalanceBefore = results[0].freeBalance;
        investorBalanceBefore = results[1].freeBalance;
      });
    }

    const performAppFinanced = () => {
      let params = InterfaceAppFinancedProposalParams.create(testJson.address, app_id, proposalId, exchange, kptAmount);
      let sign = sub.paramsSign('AppFinancedProposalParams', params, testJson.address);

      return sub.sudoAppFinance(params, testJson.address, sign, testJson.address, sign)
        .then(result => {
          expect(result.hash).toBeDefined();
        });
    };

    const balanceAfterAction = () => {
      return Promise.all([readFinFund(), readInvestorFund()]).then(results => {
        console.log("balanceAfterAction:", results);
        finFundBalanceAfter = results[0].freeBalance;
        investorBalanceAfter = results[1].freeBalance;
      });
    }

    const checkAppFinancedBalance = () => {
      console.log("checkAppFinanced");
      const changed = new BN(kptAmount + '00000000000000');
      console.log("before:", finFundBalanceBefore.toString(), investorBalanceBefore.toString());
      console.log("after:", finFundBalanceAfter.toString(), investorBalanceAfter.toString());
      expect(finFundBalanceBefore.sub(finFundBalanceAfter).cmp(changed)).toBe(0);
      expect(investorBalanceAfter.sub(investorBalanceBefore).cmp(changed)).toBe(0);
    }

    const readAppFinancedRecord = () => sub.rpcAppFinanceRecord(app_id, proposalId)
      .then(result => {
        appFinancedRecord = result;
        console.log("appFinancedRecord", appFinancedRecord);
        expect(result.block).toBeDefined();
      });

    const verifyUserHistoryBalance = () => {
      const giveUserSome = () => sub.devTransfer(exchangeUser.address, '100');
      const loadHistory = () => sub.queryAccountInfoWithBlockNum(exchangeUser.address, appFinancedRecord.block);
      return giveUserSome()
        .then(loadHistory)
        .then(result => {
          let historyBalance = result.data.free;
          // expect this balance still be exchangeUserInitialBalance
          console.log(`history:{} init:{}`, historyBalance.toString(), exchangeUserInitialBalance);
          expect(historyBalance.cmp(sub.convertBalance(exchangeUserInitialBalance))).toBe(0);
        });
    }

    const getUserPortion = () => sub.queryAppFinancedUserPortion(exchangeUser.address, app_id, proposalId)
      .then(result => {
        exchangeUserPortion = result;
        console.log("user exchange max amount:", exchangeUserPortion);
      });
      
    const userExchangeSubmit = () => {
      let params = sub.createSignObject('AppFinancedUserExchangeParams', {
        account: exchangeUser.address, 
        app_id, 
        proposal_id: proposalId, 
        exchange_amount: exchangeUserPortion
      });
      
      let user_sign = sub.paramsSign('AppFinancedUserExchangeParams', params, exchangeUser.address);
      let auth_sign = sub.paramsSign('AppFinancedUserExchangeParams', params, testJson.address);

      return sub.appFinancedUserExchangeRequest(params, exchangeUser.address, user_sign, testJson.address, auth_sign)
        .then(result => {
          expect(result.hash).toBeDefined();
        });
    };

    const checkUserExchangeLocked = () => {
      const getUserBalance = () => sub.balancesAllOrg(exchangeUser.address);
      const checkLock = (result) => {
        let reserved = result.reservedBalance;
        console.log("reserved:", reserved.toString());
        expect(reserved.cmp(sub.convertBalance(exchangeUserPortion))).toBe(0);
      }

      return getUserBalance().then(checkLock);
    };

    const userExchangeConfirm = () => {
      let beforeConfirm, afterConfirm;
      const getUserBalance = () => sub.balancesAllOrg(exchangeUser.address);

      const before = (result) => {
        beforeConfirm = result;
      }

      const after = (result) => {
        afterConfirm = result;
        // reserve be released
        expect(afterConfirm.reservedBalance.cmp(new BN(0))).toBe(0);
        // free balance not changed
        expect(afterConfirm.freeBalance.cmp(beforeConfirm.freeBalance)).toBe(0);
      }

      const confirm = () => sub.appFinancedUserExchangeConfirm(app_id, proposalId, exchangeUser.address, testJson.address);

      return getUserBalance()
        .then(before)
        .then(confirm)
        .then(getUserBalance)
        .then(after);
    }

    // test flow:
    return prepareExchangeUser()        // 准备一个测试用户账户，给予一定初始账户余额作为赎回兑换时的参考历史余额
      .then(giveInvestorAccountPayFee)  // 给融资账户一些交易费用
      .then(registerApp)                // 链上注册一个测试应用（SUDO操作）
      .then(addInvestorAccount)         // 链上注册融资账户
      .then(balanceBeforeAction)        // 读取融资提案开始前的基金和融资账户余额  
      .then(performAppFinanced)         // 执行融资提案（SUDO操作） 
      .then(balanceAfterAction)         // 读取融资提案执行后的基金和融资账户余额
      .then(checkAppFinancedBalance)    // 检查两个账户余额是否如预期
      .then(readAppFinancedRecord)      // 读取本次链上融资记录
      .then(verifyUserHistoryBalance)   // 对测试用户账户执行一次转账，检验读取融资提案执行点余额不受当前余额影响
      .then(getUserPortion)             // 获得测试用户兑换额度
      .then(userExchangeSubmit)         // 执行兑换申请
      .then(checkUserExchangeLocked)    // 检查兑换申请后，相应额度是否锁定
      .then(userExchangeConfirm);       // 发起兑换确认，检查锁定金额是否减去
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 120000);
