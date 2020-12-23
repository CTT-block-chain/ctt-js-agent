const { encode } = require('../lib/codec');
const { ModelExpertDelMemberParams } = require('../lib/signParamsDefine');

module.exports = {
  create: (app_id, model_id, member) => {
    return {
      appId: Number(app_id),
      modelId: model_id,
      member,
    };
  },

  encode: (inst) => encode(ModelExpertDelMemberParams, inst)
};
