const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, document_id, comment_id, comment_hash, comment_fee, comment_trend) => {
    return {
      appId: Number(app_id),
      documentId: document_id,
      commentId: comment_id,
      commentHash: comment_hash,
      commentFee: Math.round(Number(comment_fee) * 100),
      commentTrend: Number(comment_trend),
    };
  },

  encode: (inst) => encode('CommentData', inst)
};
