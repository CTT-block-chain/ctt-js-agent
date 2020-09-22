const XLSX = require('js-xlsx');
const xlsx = require('node-xlsx');

const sub = require('../../lib/sub');
const config = require('../../config/config');

const setupCommodityTypes = async () => {
  const workbook = xlsx.parse('tools/commodity_type_manager/id_defines.xlsx');
  //console.log(workbook);
  const sheet = workbook[0].data;
  for (let i = 2; i < sheet.length; i++) {
    let row = sheet[i];
    //console.log(row);
    let id = Number(row[4]);
    let desc = row[3];
    console.log(`processing ${id} - ${desc}`);
    if (isNaN(id) || !desc) {
      console.error('data error:', id, desc);
    } else {
      let result = await sub.addCommodityType(id, desc).catch((err) => {
        console.error('sub.addCommodityType error:', err);
      });

      console.log('add result:', result);
    }
  }
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
      return setupCommodityTypes()
        .then((result) => {
          console.log('update commodity types done!!!');
        })
        .catch((err) => {
          console.error(err);
        });
    });
  });
};

init();
//setupCommodityTypes();