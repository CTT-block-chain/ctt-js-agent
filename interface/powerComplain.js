const { stringToU8a, u8aConcat } = require('@polkadot/util');
const { uint32ToU8a } = require('../lib/util');

module.exports = {
  create: (app_id, comment_id, cart_id, comment_content) => {
    this.app_id = app_id; // String
    this.comment_id = comment_id;
    this.cart_id = cart_id;
    this.comment_content = comment_content;

    return this;
  },

  server_sign_value: (inst) => {
    /**
     * Rust code:
     *
     */
    let buf = stringToU8a(`${inst.app_id}${inst.comment_id}${inst.cart_id}`);
    //let numBuf = uint32ToU8a(inst.comment_fee);
    //return u8aConcat(buf, numBuf);
    return buf;
  },
};
