const util = require("./util");

test("Extract object field value as expected", () => {
  const obj = { foo: "bar", abc: "123", axd: 321 };
  const result = util.getObjectFieldValueStr(obj);
  expect(result).toBe("123321bar");
});
