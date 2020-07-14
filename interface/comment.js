const { stringToU8a, u8aConcat } = require("@polkadot/util");
const { uint32ToU8a } = require("../lib/util");

module.exports = {
  create: (app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend) => {
    this.app_id = app_id; // String
    this.document_id = document_id; // String
    this.comment_id = comment_id; // String
    this.comment_hash = comment_hash; // String
    this.comment_fee = comment_fee; // u32
    this.comment_trend = comment_trend; // u8

    return this;
  },

  server_sign_value: (inst) => {
    /**
     * Rust code:
     *
     */
    let buf = stringToU8a(`${inst.app_id}${inst.document_id}${inst.comment_id}`);
    let numBuf = uint32ToU8a(inst.comment_fee);
    return u8aConcat(buf, numBuf);
  },
};
