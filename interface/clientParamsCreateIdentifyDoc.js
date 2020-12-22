const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, document_id, product_id, content_hash, goods_price, ident_rate, ident_consistence, cart_id ) => {
    return {
			appId: Number(app_id),
			documentId: document_id,
			productId: product_id,
			contentHash: content_hash,
			goodsPrice: Math.round(Number(goods_price) * 100),
    	identRate: Math.round(Number(ident_rate) * 100),
    	identConsistence: Math.round(Number(ident_consistence) * 100),
    	cartId: cart_id,
    };
  },

  encode: (inst) => encode('ClientParamsCreateIdentifyDoc', inst)
};
