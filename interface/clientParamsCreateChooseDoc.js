const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, document_id, model_id, product_id, content_hash, sell_count, try_count ) => {
    return {
			appId: Number(app_id),
			documentId: document_id,
			modelId: model_id,
			productId: product_id,
			contentHash: content_hash,
			sellCount: Number(sell_count),
			tryCount: Number(try_count)
    };
  },

  encode: (inst) => encode('ClientParamsCreateChooseDoc', inst)
};
