const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, document_id, model_id, product_id, content_hash, producer_count, product_count ) => {
    return {
			appId: Number(app_id),
			documentId: document_id,
			modelId: model_id,
			productId: product_id,
			contentHash: content_hash,
			producerCount: Number(producer_count),
			productCount: Number(product_count)
    };
  },

  encode: (inst) => encode('ClientParamsCreateModelDoc', inst)
};
