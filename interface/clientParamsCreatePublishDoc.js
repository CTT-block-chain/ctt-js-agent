const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, document_id, model_id, product_id, content_hash, para_issue_rate, self_issue_rate) => {
    return {
			appId: Number(app_id),
			documentId: document_id,
			modelId: model_id,
			productId: product_id,
			contentHash: content_hash,
			paraIssueRate: Math.round(Number(para_issue_rate) * 100),
			selfIssueRate: Math.round(Number(self_issue_rate) * 100)
    };
  },

  encode: (inst) => encode('ClientParamsCreatePublishDoc', inst)
};
