const fs = require("fs");
const sub = require('../../lib/sub');
const config = require('../../config/config');

const updateAppAdmin = async () => {
  let result = await sub
    .membersSetAppAdmin('12345678', '5GsdH24tsB3NxtiewWVEeqBWFV6kT2JKCEPig7LxjxUJw4Fc')
    .catch((err) => {
      console.error('sub.membersSetAppAdmin error:', err);
    });

  console.log('result:', result);
  return result;
};

const updateAppRedeemAcount = async () => {
  const setupAdmin = () => {
    const testJson = JSON.parse(
      `{"address":"5GsdH24tsB3NxtiewWVEeqBWFV6kT2JKCEPig7LxjxUJw4Fc","encoding":{"content":["pkcs8","sr25519"],"type":"xsalsa20-poly1305","version":"2"},"encoded":"0x8487260a08850473617945eef6002f431817db5e7623628c64fc3e11285e5d66e4f9cb1af04cbda3c92cec92577349dde4b6ef5450f9992c4d30076da1d51293728f0193b25bfdf5cbdbf54354acb521fa9964a1fcc49ac6f78c02c7e02cbc6199fce3cad257b90a640caef4e59426cd0edb784c070cc444b72e090d198f9fa3409d54d9e3e4101aa7359e44750a93474af5d748d5cef8081a606dc668","meta":{"name":"admin"}}`
    );
    sub.setupAccountByJson(testJson);
    sub.unlock(testJson.address, '123456');
  };

  setupAdmin();

  let result = await sub
    .membersSetAppRedeemAccount('12345678', '5HL6pXaaHffV2Wkjq2VZ3ifUz2qYuQjfTvxcizMrSpe8popg', '5GsdH24tsB3NxtiewWVEeqBWFV6kT2JKCEPig7LxjxUJw4Fc')
    .catch((err) => {
      console.error('sub.setAppRedeemAccount error:', err);
    });

  console.log('result:', result);
  return result;
};

function sub_notify_cb(method, data) {
  console.log('SUB notify:', method, data);
}

const init = () => {
  let sudojson = fs.readFileSync("./jsonrpc/keys/sudo.json");
  if (sudojson) {
    sudojson = JSON.parse(sudojson);
    console.log(sudojson);
  }

  return sub.initKeyring(sudojson, sudojson.pwd).then(() => {
    const apiAddr = config.get('sub_endpoint');
    console.log('trying to connect to:', apiAddr);

    return sub.initApi(apiAddr, sub_notify_cb).then(() => {
      console.log('init api done!');
      return updateAppAdmin()
        .then((result) => {
          return updateAppRedeemAcount().then(result => {
            console.log('updateAppAdmin done!!!');
            process.exit();
          });
        })
        .catch((err) => {
          console.error(err);
          process.exit();
        });
    });
  });
};

init();
