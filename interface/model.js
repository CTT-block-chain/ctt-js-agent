const { stringToU8a, u8aConcat } = require("@polkadot/util");
const { uint32ToU8a } = require("../lib/util");

module.exports = {
  create: (app_id, model_id, expert_id, commodity_name, commodity_type, content_hash) => {
    this.app_id = app_id; // String
    this.model_id = model_id; // String
    this.expert_id = expert_id; // String
    this.commodity_name = commodity_name; // String
    this.commodity_type = commodity_type; // u32
    this.content_hash = content_hash; // u8

    return this;
  },

  server_sign_value: (inst) => {
    /**
     * Rust code:
     *
     */
    let buf = stringToU8a(`${inst.app_id}${inst.model_id}${inst.expert_id}`);
    //let numBuf = uint32ToU8a(inst.comment_fee);
    //return u8aConcat(buf, numBuf);
    return buf;
  },
};
