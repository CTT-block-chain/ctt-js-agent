const { encode } = require('../lib/codec');
const { ModelExpertAddMemberParams } = require('../lib/signParamsDefine');

module.exports = {
  create: (app_id, model_id, kpt_profit_rate) => {
    return {
      appId: Number(app_id),
      modelId: model_id,
      kptProfitRate: Math.round(Number(kpt_profit_rate) * 10000),
    };
  },

  encode: (inst) => encode(ModelExpertAddMemberParams, inst)
};
