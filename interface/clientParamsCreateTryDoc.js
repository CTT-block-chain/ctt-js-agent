const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, document_id, product_id, content_hash, goods_price, offset_rate, true_rate, seller_consistence, cart_id ) => {
    return {
			appId: Number(app_id),
			documentId: document_id,
			productId: product_id,
			contentHash: content_hash,
			goodsPrice: Math.round(Number(goods_price) * 100),
			offsetRate: Math.round(Number(offset_rate) * 100),
			trueRate: Math.round(Number(true_rate) * 100),
			sellerConsistence: Math.round(Number(seller_consistence) * 100),
			cartId: cart_id,
    };
  },

  encode: (inst) => encode('ClientParamsCreateTryDoc', inst)
};
