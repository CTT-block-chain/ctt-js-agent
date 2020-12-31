const { encode } = require('../lib/codec');
const { ModelIncomeCollectingParam } = require('../lib/signParamsDefine');

module.exports = {
  create: (app_id, ins) => {
		let modelIds = []
		let incomes = [];
		ins.forEach(({model_id, income}) => {
			modelIds.push(model_id);
			incomes.push(Math.round(Number(income) * 100));
		});

    return {
      appId: Number(app_id),
			modelIds,
			incomes,
    };
  },

  encode: (inst) => encode(ModelIncomeCollectingParam, inst)
};
