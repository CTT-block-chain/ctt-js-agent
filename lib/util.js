const { BN } = require('bn.js');

// data field value will be truncated together to do sign check
const getObjectFieldValueStr = (data) => {
  console.log(`getObjectFieldValueStr:${data}`);
  let sorted = Object.entries(data).sort((a, b) => {
    return a[0] < b[0] ? -1 : 1;
  });

  console.log(sorted);

  let result = '';
  sorted.forEach((item) => {
    result += item[1];
  });

  if (result.startsWith('0x')) {
    // clear 0x
    result = result.substring(2);
  }

  console.log(`getObjectFieldValueStr output: ${result}`);

  return result;
};

const uint32ToU8a = (num) => {
  return new Uint8Array([
    (num & 0xff000000) >> 24,
    (num & 0x00ff0000) >> 16,
    (num & 0x0000ff00) >> 8,
    num & 0x000000ff,
  ]);
};

const DEC_NUM = 14;

const convertBalance = (num) => {
  let sep = num.split('.');
  let int = sep[0];
  let dec = sep[1];

  if (!dec) {
    dec = '0';
  }

  let decLen = Math.min(DEC_NUM, dec.length);
  let convert = new BN(int, 10)
    .mul(new BN(Math.pow(10, DEC_NUM), 10))
    .add(new BN(dec, 10).mul(new BN(Math.pow(10, DEC_NUM - decLen))));

  console.log('convertBalance:', convert.toString());

  return convert;
};

module.exports = {
  getObjectFieldValueStr: getObjectFieldValueStr,
  uint32ToU8a: uint32ToU8a,
  convertBalance: convertBalance,
};
