const { stringToU8a, u8aConcat } = require('@polkadot/util');

module.exports = {
  create: (
    app_id,
    document_id,
    document_type,
    model_id,
    product_id,
    content_hash,

    para_issue_rate,
    self_issue_rate,

    goods_price,
    ident_rate,
    ident_consistence,
    cart_id,
    offset_rate,
    true_rate,

    sell_count,
    try_count,
    producer_count,
    product_count
  ) => {
    this.app_id = app_id; // String
    this.document_id = document_id; // String
    this.document_type = document_type; // u8
    this.model_id = model_id; // String
    this.product_id = product_id; // String
    this.content_hash = content_hash; // String

    this.para_issue_rate = para_issue_rate;
    this.self_issue_rate = self_issue_rate;
    this.goods_price = goods_price;
    this.ident_rate = ident_rate;
    this.ident_consistence = ident_consistence;
    this.cart_id = cart_id;
    this.offset_rate = offset_rate;
    this.true_rate = true_rate;

    this.sell_count = sell_count;
    this.try_count = try_count;
    this.producer_count = producer_count;
    this.product_count = product_count;

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
    let buf = stringToU8a(`${inst.app_id}${inst.document_id}`);
    return u8aConcat(buf, new Uint8Array([inst.document_type]));
  },
};
