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

module.exports = {
  getObjectFieldValueStr: getObjectFieldValueStr,
};
