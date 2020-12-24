const fs = require("fs");
const sub = require('../../lib/sub');
const config = require('../../config/config');

const updateAppModelMaxCount = async () => {
  let result = await sub.setModelMax('100000001', 1000).catch((err) => {
    console.error('sub.setModelMax error:', err);
  });

  console.log('result:', result);
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
      return updateAppModelMaxCount()
        .then((result) => {
          console.log('updateAppModelMaxCount done!!!');
          process.exit();
        })
        .catch((err) => {
          console.error(err);
          process.exit();
        });
    });
  });
};

init();
