const { encode } = require('../lib/codec');

module.exports = {
  create: (appId, modelId ) => {
    return {
			appId: Number(appId),
    	modelId
    };
  },

  encode: (inst) => encode('ModelKeyParams', inst)
};
