const { stringToU8a, u8aConcat } = require('@polkadot/util');
const { uint32ToU8a } = require('../lib/util');

module.exports = {
  create: (app_id, comment_id, model_id, comment_content, dispute_type) => {
    this.app_id = app_id; // String
    this.comment_id = comment_id;
    this.model_id = model_id;
		this.comment_content = comment_content;
		this.dispute_type = Number(dispute_type);

    return this;
  },

  server_sign_value: (inst) => {
    /**
     * Rust code:
     *
     */
    let buf = stringToU8a(`${inst.app_id}${inst.comment_id}${inst.model_id}`);
    //let numBuf = uint32ToU8a(inst.comment_fee);
    //return u8aConcat(buf, numBuf);
    return buf;
  },
};
