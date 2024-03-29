const fs = require('fs');
const { BN } = require('bn.js');
const sub = require('./sub');
const InterfaceClientParamsCreateModel = require('../interface/clientParamsCreateModel');
const InterfaceAuthParamsCreateModel = require('../interface/authParamsCreateModel');
const InterfaceComment = require('../interface/comment');
const InterfaceAddAppParams = require('../interface/addAppParams');
const InterfaceAppFinancedProposalParams = require('../interface/appFinancedProposalParams');
const InterfaceAppFinancedUserExchangeParams = require('../interface/appFinancedUserExchangeParams');

const InterfaceClientParamsCreatePublishDoc = require('../interface/clientParamsCreatePublishDoc');
const InterfaceClientParamsCreateIdentifyDoc = require('../interface/clientParamsCreateIdentifyDoc');
const InterfaceClientParamsCreateTryDoc = require('../interface/clientParamsCreateTryDoc');
const InterfaceClientParamsCreateChooseDoc = require('../interface/clientParamsCreateChooseDoc');
const InterfaceClientParamsCreateModelDoc = require('../interface/clientParamsCreateModelDoc');

const InterfaceModelExpertAddMemberParams = require('../interface/modelExpertAddMemberParams');
const InterfaceModelExpertDelMemberParams = require('../interface/modelExpertDelMemberParams');

const InterfaceAppIncomeRedeemParams = require('../interface/appIncomeRedeemParams');
const InterfaceAppIncomeRedeemConfirmParams = require('../interface/appIncomeRedeemConfirmParams');

const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
const config = require('../config/config');
const { AppFinancedProposalParams, AppFinancedUserExchangeParams, CommentData,
  AddAppParams, AuthParamsCreateModel, ClientParamsCreateModel, ClientParamsCreatePublishDoc,
  ClientParamsCreateIdentifyDoc, ClientParamsCreateTryDoc, ClientParamsCreateChooseDoc, 
  ClientParamsCreateModelDoc, ModelExpertAddMemberParams, ModelExpertDelMemberParams } = require('./signParamsDefine');

// some global defines
let APP_ID = 100000001;
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

test('should register app success', () => {
  const processTest = () => {
    let params = sub.createSignObject('AddAppParams', {
      app_type: 'default',
      app_name: 'jianfa',
      app_key: sub.getDevAdmin().address,
      app_admin_key: sub.getDevAdmin().address,
      return_rate: 1,
    });

    let sign = sub.paramsSign('AddAppParams', params, sub.getDevAdmin().address);
    return sub.sudoAddApp(params, sub.getDevAdmin().address, sign)
      .then(data => {
        console.log("registerApp:", data);
        if (!!data && !!data.app_id) {
          APP_ID = Number(data.app_id);
        }
        expect(APP_ID).toBe(100000001);
      });
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .then((result) => {
      console.log(result);
      //expect(result.hash).toBeDefined();
      expect(true).toBe(true);
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

    let client_params = InterfaceClientParamsCreateModel.create(APP_ID, 'E0001', 'name1', MODEL_TYPE, sub.hash('hello'));
    let user_sign = sub.paramsSign(ClientParamsCreateModel, client_params, testJson.address);
    let auth_params = InterfaceAuthParamsCreateModel.create(MODEL_ID);
    let auth_sign = sub.paramsSign(AuthParamsCreateModel, auth_params, sub.getDevAdmin().address);
 
    return sub.createModel(client_params, auth_params, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign);
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

    let params = InterfaceClientParamsCreateModelDoc.create(APP_ID, DOC_MODEL_CREATE_ID, MODEL_ID, 'P0001' + new Date().getTime(), sub.hash('Hello'), 0, 0);
    let user_sign = sub.paramsSign(ClientParamsCreateModelDoc, params, testJson.address);
    let auth_sign = sub.paramsSign(ClientParamsCreateModelDoc, params, sub.getDevAdmin().address);

    return sub.createDocument(4, params, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign);
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

    let params = InterfaceClientParamsCreatePublishDoc.create(APP_ID, DOC_PUBLISH_ID, MODEL_ID, PRODUCT_ID, sub.hash('hello'), '50', '40', '30');
    let user_sign = sub.paramsSign(ClientParamsCreatePublishDoc, params, testJson.address);
    let auth_sign = sub.paramsSign(ClientParamsCreatePublishDoc, params, sub.getDevAdmin().address);

    return sub.createDocument(0, params, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign);
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

    let params = InterfaceClientParamsCreateIdentifyDoc.create(APP_ID, DOC_IDENTIFY_ID, PRODUCT_ID, sub.hash('hello'), '100', '23', '78', '0.00', 'C0001' + new Date().getTime());
    let user_sign = sub.paramsSign(ClientParamsCreateIdentifyDoc, params, testJson.address);
    let auth_sign = sub.paramsSign(ClientParamsCreateIdentifyDoc, params, sub.getDevAdmin().address);
    return sub.createDocument(1, params, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign);
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

    let params = InterfaceClientParamsCreateTryDoc.create(APP_ID, DOC_TRY_ID, PRODUCT_ID, sub.hash('hello'), '200', '99', '87', '40', 'C0001' + new Date().getTime());
    let user_sign = sub.paramsSign(ClientParamsCreateTryDoc, params, testJson.address);
    let auth_sign = sub.paramsSign(ClientParamsCreateTryDoc, params, sub.getDevAdmin().address);
    return sub.createDocument(2, params, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign);
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

    let params = InterfaceClientParamsCreateChooseDoc.create(APP_ID, DOC_PRODUCT_CHOOSE_ID, MODEL_ID, PRODUCT_ID, sub.hash('hello'), 2, 34);
    let user_sign = sub.paramsSign(ClientParamsCreateChooseDoc, params, testJson.address);
    let auth_sign = sub.paramsSign(ClientParamsCreateChooseDoc, params, sub.getDevAdmin().address);
    return sub.createDocument(3, params, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign);
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

// power compute test
test('should power compute correct', () => {
  const processTest = () => {
    const pwd = '123456';
    //let accountA = sub.newAccount('a', pwd);
    //console.log("accountA address")
    //let accountAJSON = JSON.parse(`{"address":"5HNSzWPh9jJngEbwN35qPaZ1L2cQvyMrGEkwFYLwazeenJEH","encoded":"DeIvE15MWJzoo56j0sOFl3/+CTinFTdKWRJSfG5c3oQAgAAAAQAAAAgAAACx51NBJjUiu5eEVcGEo5N87qbXMx+kv6R6tBlq+s+XC7aNsEkwsyZgBuu+EH1o4GzDaQadtAL6310NjHMUowfzzyOggOhiJD6eSJkE744Csa0GGo6kDym927gpK2JkCOPAiCrYxH9Wxuxa8xOAppm+UjyXCPWi1scz1ODwvUYcsazgEb4glxTrQv9R8U5VHfMgXjFNo1u/Z3rZmHKm","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"meta":{"genesisHash":"0x1a6264703dc6a82fca8fcdb4288f7cfcec79e6ec5a5f0b42bd82dcba628387e0","name":"stash1","tags":[],"whenCreated":1615203945281}}`);
    let accountAJSON = JSON.parse(`{"address":"5FnnzSBmzg599NPCdwTeLJXRh1XRXQkRhdUC8fXEDvkPb3Ap","encoded":"W4osoYaMlEM604qzQO0xlhSlYfhTZEvUS6sFedaJkIkAgAAAAQAAAAgAAAB4ieE/kfLcUxTDNlAaxeUdN6M4e6uVwtVdziRxGfzaEokUvMYj6NrNp0zd9WrI5y1IAiqu9POweMs7kMZ5LQF6IZmgt8mA8LgS9KJz5oJ+pmcOyHbD2sjk+A3b8Zjblq3D3Pgsw3jgOp1MdBx4m5IKGj1fislSi+9F0xHDXMVsD18/zpKxmMgf4j1KZjZk7mQzLL9yOZJUaf0q6zfA","encoding":{"content":["pkcs8","sr25519"],"type":["scrypt","xsalsa20-poly1305"],"version":"3"},"meta":{"genesisHash":"0x8a099ebb2a45003e21d5e726317e0fbac60835d69ed2bbd14f6e18e366a290bf","name":"n1","tags":[],"whenCreated":1617455411031}}`);
    let accountA = sub.setupAccountByJson(accountAJSON);

    let accountB = sub.newAccount('b', pwd);
    sub.unlock(accountAJSON.address, pwd);
    sub.unlock(accountB.json.address, pwd);

    let app_id;
    const model_type = 100001;
    const pub_doc_id = 'doc_pub';
    const identify_doc_id = 'doc_identify';
    const try_doc_id = 'dpc_try';
    const cart_id = 'cart_id';
    const goods_price = '100';
    const model_id = 'model_id';
    const product_id = 'product_id';
    const ts = new Date().getTime();
    
    const prepareFees = async () => {
      await sub.devTransfer(accountAJSON.address, '1000');
      await sub.devTransfer(accountB.json.address, '1000');
    }

    // sudo action
    const registerApp = () => {
      let params = sub.createSignObject('AddAppParams', {
        app_type: 'commodity_general',
        app_name: 'test',
        app_key: sub.getDevAdmin().address,
        app_admin_key: sub.getDevAdmin().address,
        return_rate: 1,
      });

      let sign = sub.paramsSign('AddAppParams', params, sub.getDevAdmin().address);
      return sub.sudoAddApp(params, sub.getDevAdmin().address, sign)
        .then(data => {
          console.log("registerApp:", data);
          app_id = data.app_id
          expect(app_id).toBeDefined();
        });
    };

    const addModelType = () => sub.addCommodityType(model_type, 'test type');

    const createModel = async () => {
      let client_params = InterfaceClientParamsCreateModel.create(app_id, 'E0001', 'name1', model_type, sub.hash('hello'));
      let user_sign = sub.paramsSign(ClientParamsCreateModel, client_params, accountAJSON.address);
      let auth_params = InterfaceAuthParamsCreateModel.create(model_id);
      let auth_sign = sub.paramsSign(AuthParamsCreateModel, auth_params, sub.getDevAdmin().address);

      return sub.createModel(client_params, auth_params, accountAJSON.address, user_sign, sub.getDevAdmin().address, auth_sign);
    };

    const createPubDoc = () => {
      let params = InterfaceClientParamsCreatePublishDoc.create(app_id, pub_doc_id, model_id, product_id, sub.hash('hello'), '98', '86', '5');
      let user_sign = sub.paramsSign(ClientParamsCreatePublishDoc, params, accountAJSON.address);
      let auth_sign = sub.paramsSign(ClientParamsCreatePublishDoc, params, sub.getDevAdmin().address);

      return sub.createDocument(0, params, accountAJSON.address, user_sign, sub.getDevAdmin().address, auth_sign);
    };

    const createIdentifyDoc = () => {
      let params = InterfaceClientParamsCreateIdentifyDoc.create(app_id, identify_doc_id, product_id, sub.hash('hello'), goods_price, '75', '83', '86', cart_id);
      let user_sign = sub.paramsSign(ClientParamsCreateIdentifyDoc, params, accountAJSON.address);
      let auth_sign = sub.paramsSign(ClientParamsCreateIdentifyDoc, params, sub.getDevAdmin().address);
      return sub.createDocument(1, params, accountAJSON.address, user_sign, sub.getDevAdmin().address, auth_sign);
    };

    const createTryDoc = () => {
      let params = InterfaceClientParamsCreateTryDoc.create(app_id, try_doc_id, product_id, sub.hash('hello'), goods_price, '83', '83', '95', cart_id);
      let user_sign = sub.paramsSign(ClientParamsCreateTryDoc, params, accountAJSON.address);
      let auth_sign = sub.paramsSign(ClientParamsCreateTryDoc, params, sub.getDevAdmin().address);
      return sub.createDocument(2, params, accountAJSON.address, user_sign, sub.getDevAdmin().address, auth_sign);
    };

    const commentPub = async () => {
      let c = InterfaceComment.create(app_id, pub_doc_id, 'C0001' + ts, sub.hash('comment'), "1", "0");
      let owner_sign = sub.paramsSign('CommentData', c, accountB.json.address);
      let auth_sign = sub.paramsSign('CommentData', c, sub.getDevAdmin().address); 
      await sub.createComment(c, accountB.json.address, owner_sign, sub.getDevAdmin().address, auth_sign);

      c = InterfaceComment.create(app_id, pub_doc_id, 'C0002' + ts, sub.hash('comment'), "2", "0");
      owner_sign = sub.paramsSign('CommentData', c, accountAJSON.address);
      auth_sign = sub.paramsSign('CommentData', c, sub.getDevAdmin().address); 
      await sub.createComment(c, accountAJSON.address, owner_sign, sub.getDevAdmin().address, auth_sign);
    };

    const commentTry = async () => {
      let c = InterfaceComment.create(app_id, try_doc_id, 'C0003' + ts, sub.hash('comment'), "1", "0");
      let owner_sign = sub.paramsSign('CommentData', c, accountAJSON.address);
      let auth_sign = sub.paramsSign('CommentData', c, sub.getDevAdmin().address); 
      await sub.createComment(c, accountAJSON.address, owner_sign, sub.getDevAdmin().address, auth_sign);
    };

    const readCommodityPower = async () => {
      let power = await sub.rpcGetCommodityPower(app_id, [cart_id]);
      console.log("commodity power:", power[0]); 
      expect(true).toBe(true)
    };

    const createLeaderBoard = async () => {
      let result = await sub.createPowerLeaderBoard(app_id, "");
      console.log("createLeaderBoard for app:", result);
      expect(result.hash).toBeDefined();
      let board_result = await sub.rpcLeaderBoardLoad(app_id, "", result.data.block);
      console.log("leader board app result:", board_result);

      result = await sub.createPowerLeaderBoard(app_id, model_id);
      console.log("createLeaderBoard for model:", result);
      expect(result.hash).toBeDefined();

      board_result = await sub.rpcLeaderBoardLoad(app_id, model_id, result.data.block);
      console.log("leader board model result:", board_result);
    }

    return prepareFees()        // 准备测试账户及费用 （A B 账户）
      .then(registerApp)        // 注册应用
      .then(addModelType)       // 增加测试模型类型
      .then(createModel)        // 创建测试模型
      .then(createPubDoc)       // 创建参数发布文章 （A）
      .then(createIdentifyDoc)  // 创建品鉴文章 （A）
      .then(createTryDoc)       // 创建体验文章 （A）
      //.then(commentPub)         // 评论参数发布文章2次 （AB） 
      //.then(commentTry)         // 评论体验文章1次 （A）  
      .then(readCommodityPower) // 读取体验商品算力
      .then(createLeaderBoard)
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });

}, 600000);

test('should set app admin success', () => {
  const processTest = () => {
    let app_id;
    const pwd = '123';
    const appRootAdminAccount = sub.newAccount('1', pwd);
    const appRootKeyAccount = sub.newAccount('2', pwd);
    const testAdmin = sub.newAccount('3', pwd);
    const testKey = sub.newAccount('4', pwd);

    sub.unlock(appRootAdminAccount.json.address, pwd);
    sub.unlock(appRootKeyAccount.json.address, pwd);
    sub.unlock(testAdmin.json.address, pwd);
    sub.unlock(testKey.json.address, pwd);

    const prepareFees = async () => {
      await sub.devTransfer(appRootKeyAccount.json.address, '100');
      await sub.devTransfer(appRootAdminAccount.json.address, '100');
    }

    const registerApp = async () => {
      let params = sub.createSignObject('AddAppParams', {
        app_type: 'commodity_general',
        app_name: 'test',
        app_key: appRootKeyAccount.json.address,
        app_admin_key: appRootAdminAccount.json.address,
        return_rate: 1,
      });

      let sign = sub.paramsSign('AddAppParams', params, appRootAdminAccount.json.address);
      await sub.sudoAddApp(params, appRootAdminAccount.json.address, sign)
        .then(data => {
          console.log("registerApp:", data);
          app_id = data.app_id
          expect(app_id).toBeDefined();
        });

      // expect root admin and root key has been added
      
      let isExist = await expectKeyInGroup(appRootAdminAccount.json.address, true);
      expect(isExist).toBe(true);

      isExist = await expectKeyInGroup(appRootKeyAccount.json.address, false);
      expect(isExist).toBe(true);
    }

    const expectKeyInGroup = async (key, isAdmin) => {
      let members;
      if (isAdmin) {
        members = await queryAppAdmins();
      } else {
        members = await queryAppKeys();
      }

      let isFound = false;
      members.forEach(item => {
        item = item.toString();
        console.log(`item:${item} ${key}`);
        if (item == key) {
          console.log("found match");
          isFound = true;
        }
      });

      return isFound;
    };

    const expectKeyNotInGroup = async (key, isAdmin) => {
      let members;
      if (isAdmin) {
        members = await queryAppAdmins();
      } else {
        members = await queryAppKeys();
      }

      let isFound = false;
      members.forEach(item => {
        item = item.toString();
        if (item == key) {
          isFound = true
        }
      });

      return !isFound;
    };

    const addAdmin = async () => {
      let params = sub.createSignObject('AppKeyManageParams', {
        app_id, 
        admin: appRootAdminAccount.json.address, 
        member: testAdmin.json.address
      });

      let sign = sub.paramsSign('AppKeyManageParams', params, appRootAdminAccount.json.address);
      let result = await sub.membersAddAppAdmin(appRootKeyAccount.json.address, params, sign);

      expect(result.hash).toBeDefined();

      // after add expect member has been added to group
      let isExist = await expectKeyInGroup(testAdmin.json.address, true);
      expect(isExist).toBe(true);
    }

    const addAppKey = async () => {
      let params = sub.createSignObject('AppKeyManageParams', {
        app_id, 
        admin: appRootAdminAccount.json.address, 
        member: testKey.json.address
      });

      let sign = sub.paramsSign('AppKeyManageParams', params, appRootAdminAccount.json.address);
      let result = await sub.membersAddAppKey(appRootKeyAccount.json.address, params, sign);

      expect(result.hash).toBeDefined();

      let isExist = await expectKeyInGroup(testKey.json.address, false);
      expect(isExist).toBe(true);
    }

    const removeAdmin = async () => {
      let params = sub.createSignObject('AppKeyManageParams', {
        app_id, 
        admin: appRootAdminAccount.json.address, 
        member: testAdmin.json.address
      });

      let sign = sub.paramsSign('AppKeyManageParams', params, appRootAdminAccount.json.address);
      let result = await sub.membersRemoveAppAdmin(appRootKeyAccount.json.address, params, sign);

      expect(result.hash).toBeDefined();

      let isNotExist = await expectKeyNotInGroup(testAdmin.json.address, true);
      expect(isNotExist).toBe(true);
    }

    const removeAppKey = async () => {
      let params = sub.createSignObject('AppKeyManageParams', {
        app_id, 
        admin: appRootAdminAccount.json.address, 
        member: testKey.json.address
      });

      let sign = sub.paramsSign('AppKeyManageParams', params, appRootAdminAccount.json.address);
      let result = await sub.membersRemoveAppKey(appRootKeyAccount.json.address, params, sign);

      expect(result.hash).toBeDefined();

      let isNotExist = await expectKeyNotInGroup(testKey.json.address, false);
      expect(isNotExist).toBe(true);
    }

    const queryAppAdmins = async () => {
      let result = await sub.queryAppAdmins(app_id);
      console.log("queryAppAdmins:", JSON.stringify(result));
      return result;
    }

    const queryAppKeys = async () => {
      let result = await sub.queryAppKeys(app_id);
      console.log("queryAppKeys:", JSON.stringify(result));
      return result;
    }

    return prepareFees()
      .then(registerApp)
      .then(addAdmin)
      .then(addAppKey)
      .then(removeAdmin)
      .then(removeAppKey);
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
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

    return sub.membersAddInvestor(sub.getDevAdmin().address, APP_ID, testAccount.json.address);
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

    return transfer().then(() => {
      let params = InterfaceModelExpertAddMemberParams.create(APP_ID, MODEL_ID, '0.01');
      let sign = sub.paramsSign(ModelExpertAddMemberParams, params, creatorJson.address);

      return sub.membersAddExpertByCreator(params, creatorJson.address, sign, memberJson.address);
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

    let params = InterfaceModelExpertDelMemberParams.create(APP_ID, MODEL_ID, memberJson.address);
    let user_sign = sub.paramsSign(ModelExpertDelMemberParams, params, creatorJson.address);
    let auth_sign = sub.paramsSign(ModelExpertDelMemberParams, params, sub.getDevAdmin().address);

    return sub.membersRemoveExpertByCreator(
      params,
      creatorJson.address,
      user_sign,
      sub.getDevAdmin().address,
      auth_sign
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

    return sub.membersStableExchange(APP_ID, 'abc' + TIMESTAMP, testAccount.json.address, '10', sub.getDevAdmin().address);
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


test('should add finance member success', () => {
  
  const processTest = async () => {
    // prepare 3 accounts with different deposit
    const account1 = sub.newAccount('account1').json;
    const account2 = sub.newAccount('account2').json;
    const account3 = sub.newAccount('account3').json;
    
    sub.unlock(account1.address);
    sub.unlock(account2.address);
    sub.unlock(account3.address);

    console.log('max finance member address:', account2.address);

    await sub.devTransfer(account1.address, '20000');
    await sub.devTransfer(account2.address, '40000');
    await sub.devTransfer(account3.address, '30000');

    let signObj = sub.createSignObject('FinanceMemberParams', {deposit: "10000", member: account1.address});
    let sign = sub.paramsSign('FinanceMemberParams', signObj, account1.address);

    let result = await sub.membersAddFinanceMember(signObj, sub.getDevAdmin().address, account1.address, sign);
    expect(result.hash).toBeDefined();

    signObj = sub.createSignObject('FinanceMemberParams', {deposit: "20000", member: account2.address});
    sign = sub.paramsSign('FinanceMemberParams', signObj, account2.address);

    result = await sub.membersAddFinanceMember(signObj, sub.getDevAdmin().address, account2.address, sign);
    expect(result.hash).toBeDefined();

    signObj = sub.createSignObject('FinanceMemberParams', {deposit: "15000", member: account3.address});
    sign = sub.paramsSign('FinanceMemberParams', signObj, account3.address);

    result = await sub.membersAddFinanceMember(signObj, sub.getDevAdmin().address, account3.address, sign);
    expect(result.hash).toBeDefined();
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
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
    const exchangeUserInitialBalance = '30000';

    let finMember = sub.newAccount('fin').json;

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
      return sub.sudoAddApp(params, testJson.address, sign)
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

    const addFinanceMember = async () => {
      // give deposit value to finance member
      //sub.unlock(finMember.address);
      //await sub.devTransfer(finMember.address, '20000');
      let signObj = sub.createSignObject('FinanceMemberParams', {deposit: "10000", member: sub.getDevAdmin().address});
      let sign = sub.paramsSign('FinanceMemberParams', signObj, sub.getDevAdmin().address);

      let result = await sub.membersAddFinanceMember(signObj, sub.getDevAdmin().address, sub.getDevAdmin().address, sign);
      //expect(result.hash).toBeDefined();
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
      let auth_sign = sub.paramsSign('AppFinancedProposalParams', params, sub.getDevAdmin().address);

      return sub.sudoAppFinance(params, testJson.address, sign, sub.getDevAdmin().address, auth_sign)
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
          expect(result.finance_member).toBe(finMember.address);
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

      const confirm = () => {
        let obj = sub.createSignObject('AppFinancedUserExchangeConfirmParams', {
          account: exchangeUser.address,
          app_id,
          pay_id: 'pay_test_id',
          proposal_id: proposalId
        });
        return sub.appFinancedUserExchangeConfirm(obj, testJson.address);
      };

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
      .then(addFinanceMember)           // 增加一个财务管理成员，用于赎回确认
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

test('should model cycle income test success', () => {
  const processTest = () => {
    const testJson = JSON.parse(
      `{"address":"5FHittguiXZgbt5qu1frKASSedmxy6QLYDHSRVsf6B7Dj9qk","encoded":"0x2b48c01814f5329eb53021403039f2d5ceee84b470506d0f57c2e9c3e6ec6ccc08cf4e418b04528185d84c68023394ad77f5fe615590a35bbe26b16d1227a7e00ffa77ee946ac67e9b3cbc3cb4937d572b0c2995862e21c174d36ab2d1c938ce95ffa8a65caa755e428e3ab93fc9e64b8eaff6c200d45ed9954ec88bbb3236adfd08d49dc8e8abd84aab9c1af1eccf40a25ece9d35c8a5f757b8e3c495","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"meta":{"name":"bob"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');

    let app_id;
    let model_type = 100000;
    let stage = '0'; // default stage
    
    let incomes = [
      {
        model_id: "M01",
        income: '10000'
      },
      {
        model_id: "M02",
        income: '20000'
      },
      {
        model_id: "M03",
        income: '30000'
      },
      {
        model_id: "M04",
        income: '40000'
      }
    ];

    // give some fees
    const prepareFees = () => sub.devTransfer(testJson.address, '100000');

    // sudo action
    const registerApp = () => {
      let params = sub.createSignObject('AddAppParams', {
        app_type: 'commodity_general',
        app_name: 'test',
        app_key: testJson.address,
        app_admin_key: testJson.address,
        return_rate: 5000, // 0.5
      });

      let sign = sub.paramsSign('AddAppParams', params, testJson.address);
      return sub.sudoAddApp(params, testJson.address, sign)
        .then(data => {
          console.log("registerApp:", data);
          app_id = data.app_id
          expect(app_id).toBeDefined();
        });
    };

    const addModelType = () => sub.addCommodityType(model_type, 'test type');

    const createModels = async () => {
      const createModel = async (model_id) => {
        let client_params = InterfaceClientParamsCreateModel.create(app_id, 'E0001', 'name1', model_type, sub.hash('hello'));
        let user_sign = sub.paramsSign(ClientParamsCreateModel, client_params, testJson.address);
        let auth_params = InterfaceAuthParamsCreateModel.create(model_id);
        let auth_sign = sub.paramsSign(AuthParamsCreateModel, auth_params, testJson.address);
  
        return sub.createModel(client_params, auth_params, testJson.address, user_sign, testJson.address, auth_sign);
      }

      let results = [];
      for (let i = 0; i < incomes.length; i++) {
        results.push(await createModel(incomes[i].model_id));
      }

      // return expected next stage
      return '1'
    }

    const waitingStage = async (target) =>
      new Promise(resolve => {
        let timer = setInterval(async () => {
          let result = await sub.rpcModelIncomeCurrentStage();
          console.log('waitingStage:', result);
          if (result.stage === target) {
            clearInterval(timer);
            resolve();            
          }
        }, 60000);
      });

    const setModelsIncome = () => {
      let data = {
        app_id,
        incomes
      };
      let interfaceObj = sub.createSignObject('ModelIncomeCollectingParam', data);
      let user_sign = sub.paramsSign('ModelIncomeCollectingParam', interfaceObj, testJson.address);
      let auth_sign = sub.paramsSign('ModelIncomeCollectingParam', interfaceObj, sub.getDevAdmin().address);
      return sub.setBatchModelPeriodIncome(interfaceObj, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign)
        .then(result => {
          expect(result.hash).toBeDefined();
          // return expected next stage
          return '2';
        })
    }

    const requestRewarding = async () => {
      let before, after;
      let modelIndex = 0;
      
      let result = await sub.rpcModelIncomeCurrentStage();
      console.log('requestRewarding stage:', result);

      if (result.stage === '1') {
        console.log('not ready for rewarding, waiting:', result.left_seconds);
        await sleep((Number(result.left_seconds) + 12) * 1000);

        // after waiting
        result = await sub.rpcModelIncomeCurrentStage();
        console.log('after waiting, requestRewarding stage:', result);
      }

      const balanceBefore = () => {
        return sub.balancesAllOrg(testJson.address).then(result => {
          before = result.freeBalance
        });
      }

      const doRequest = () => {
        return sub.requestModelCycleReward(app_id, incomes[modelIndex].model_id, testJson.address);
      };

      const appRewardRedeem = async () => {
        // first get app ratio of rewarding
        const { portion, cycle } = await sub.queryAppCycleIncomeUserPortion(testJson.address, app_id);
        console.log("portion:", portion, cycle);

        if (!portion) {
          expect(true).toBeFalsy();
          return;
        }

        let interfaceObj = InterfaceAppIncomeRedeemParams.create(app_id, testJson.address, cycle, portion);
        let user_sign = sub.paramsSign('AppIncomeRedeemParams', interfaceObj, testJson.address);
        let auth_sign = sub.paramsSign('AppIncomeRedeemParams', interfaceObj, sub.getDevAdmin().address);

        let result = await sub.appIncomeUserExchangeRequest(interfaceObj, testJson.address, user_sign, sub.getDevAdmin().address, auth_sign);
        expect(result.hash).toBeDefined();

        // check reserve
        const balance = await sub.balancesAllOrg(testJson.address);
        let reserved = balance.reservedBalance;
        expect(reserved.cmp(sub.convertBalance(portion))).toBe(0);
    
        // confirm
        let obj = sub.createSignObject('AppIncomeRedeemConfirmParams', {
          account: testJson.address,
          app_id,
          pay_id: 'pay_test_id',
          cycle
        });
        result = await sub.appIncomeUserExchangeConfirm(obj, sub.getDevAdmin().address);
        expect(result.hash).toBeDefined();
      }

      const balanceAfter = () => {
        return sub.balancesAllOrg(testJson.address).then(result => {
          after = result.freeBalance
        });
      }
      
      const checkResult = () => {
        let totalIncome = 0;
        incomes.forEach(item => {
          totalIncome += Number(item.income);
        });

        let expectedReward = Math.round(10000 * Number(incomes[modelIndex].income) / totalIncome);
        let increase = Number(after.sub(before).div(new BN(1e14)).toString());
        console.log(`expectedReward:${expectedReward} increase:${increase}`);

        expect(expectedReward - increase).toBeLessThanOrEqual(1);
      };
      
      return balanceBefore()
        .then(doRequest)
        .then(balanceAfter)
        .then(checkResult)
        .then(appRewardRedeem)
        .then(doRequest)
        .then(result => {
          // repeat request should fail
          expect(result.hash).toBeFalsy();
        });
    };

    return prepareFees()        // 准备测试账户及测试费用
      .then(registerApp)        // 注册新应用
      .then(addModelType)       // 增加测试模型类型
      .then(createModels)       // 创建测试模型（4个以上） 
      .then(waitingStage)       // 等待阶段1到达
      .then(setModelsIncome)    // 统计模型收入
      .then(waitingStage)       // 等待阶段2到达
      .then(requestRewarding);  // 申领模型1奖励，并检查期望奖励KPT是否到账, 检测重复申领
  };

  return initKeyring()
    .then(initApi)
    .then(processTest)
    .catch((e) => {
      console.error(e);
      expect(true).toBe(false);
    });
}, 3600000);


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

