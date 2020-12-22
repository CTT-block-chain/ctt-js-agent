const { encode } = require('../lib/codec');

module.exports = {
  create: (model_id) => {
    return {
      modelId: model_id,
    };
  },

  encode: (inst) => encode('AuthParamsCreateModel', inst)
};
