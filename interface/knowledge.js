const { stringToU8a, u8aConcat } = require("@polkadot/util");

module.exports = {
  create: (
    app_id,
    knowledge_id,
    knowledge_type,
    model_id,
    product_id,
    content_hash,
    extra_compute_ratio,
    tx_id,
    memo_hash
  ) => {
    this.app_id = app_id; // String
    this.knowledge_id = knowledge_id; // String
    this.knowledge_type = knowledge_type; // u8
    this.model_id = model_id; // String
    this.product_id = product_id; // String
    this.content_hash = content_hash; // String
    this.extra_compute_ratio = extra_compute_ratio; // u8 0-100
    this.tx_id = tx_id; // String
    this.memo_hash = memo_hash; // String
    return this;
  },

  server_sign_value: (inst) => {
    /**
     * Rust code:
     * let mut buf = vec![];
      buf.append(&mut(app_id.clone()));
      buf.append(&mut(knowledge_id.clone()));
      buf.append(&mut vec![knowledge_type, extra_compute_param]);
     */
    let buf = stringToU8a(`${inst.app_id}${inst.knowledge_id}`);
    return u8aConcat(buf, new Uint8Array([inst.knowledge_type, inst.extra_compute_ratio]));
  },
};
