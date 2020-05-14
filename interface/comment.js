const { stringToU8a, u8aConcat } = require("@polkadot/util");

module.exports = {
  create: (app_id, knowledge_id, comment_id, last_comment_id, comment_hash, comment_fee, knowledge_profit) => {
    this.app_id = app_id; // String
    this.knowledge_id = knowledge_id; // String
    this.comment_id = comment_id; // String
    this.last_comment_id = last_comment_id; // String
    this.comment_hash = comment_hash; // String
    this.comment_fee = comment_fee; // u32
    this.knowledge_profit = knowledge_profit; // u32

    return this;
  },

  server_sign_value: (inst) => {
    /**
     * Rust code:
     *
     */
    // TODO:
    let buf = stringToU8a(`${inst.app_id}${inst.knowledge_id}${inst.comment_id}`);
    return u8aConcat(buf, new Uint8Array([]));
  },
};
