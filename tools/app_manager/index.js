const sub = require('../../lib/sub');
const config = require('../../config/config');

const updateAppAdmin = async () => {
  let result = await sub
    .membersSetAppAdmin('12345678', '5GsdH24tsB3NxtiewWVEeqBWFV6kT2JKCEPig7LxjxUJw4Fc')
    .catch((err) => {
      console.error('sub.membersSetAppAdmin error:', err);
    });

  console.log('result:', result);
};

function sub_notify_cb(method, data) {
  console.log('SUB notify:', method, data);
}

const init = () => {
  return sub.initKeyring().then(() => {
    const apiAddr = config.get('sub_endpoint');
    console.log('trying to connect to:', apiAddr);

    return sub.initApi(apiAddr, sub_notify_cb).then(() => {
      console.log('init api done!');
      return updateAppAdmin()
        .then((result) => {
          console.log('updateAppAdmin done!!!');
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
