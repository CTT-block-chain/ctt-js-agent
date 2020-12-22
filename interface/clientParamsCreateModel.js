const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, expert_id, commodity_name, commodity_type, content_hash) => {
    return {
      appId: Number(app_id),
			expertId: expert_id,
			commodityName: commodity_name,
			commodityType: Number(commodity_type),
			contentHash: content_hash,
    };
  },

  encode: (inst) => encode('ClientParamsCreateModel', inst)
};
