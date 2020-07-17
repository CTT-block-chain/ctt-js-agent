// data field value will be truncated together to do sign check
const getObjectFieldValueStr = (data) => {
  console.log(`getObjectFieldValueStr:${data}`);
  let sorted = Object.entries(data).sort((a, b) => {
    return a[0] < b[0] ? -1 : 1;
  });

  console.log(sorted);

  let result = "";
  sorted.forEach((item) => {
    result += item[1];
  });

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

module.exports = {
  getObjectFieldValueStr: getObjectFieldValueStr,
  uint32ToU8a: uint32ToU8a,
};