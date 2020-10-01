const { stringToU8a, u8aConcat } = require('@polkadot/util');
const { uint32ToU8a } = require('../lib/util');

module.exports = {
  create: (app_name, app_type, identity_key, admin_key, return_rate) => {
    this.app_name = app_name; // String
    this.app_type = app_type;
    this.identity_key = identity_key;
    this.admin_key = admin_key;
    this.return_rate = return_rate;

    return this;
  },

  server_sign_value: (inst) => {
    /**
     * Rust code:
     *
     */
    let buf = stringToU8a(`${inst.app_name}`);
    //let numBuf = uint32ToU8a(inst.comment_fee);
    //return u8aConcat(buf, numBuf);
    return buf;
  },
};
