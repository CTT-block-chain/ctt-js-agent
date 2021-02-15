const { encode } = require('../lib/codec');

module.exports = {
  create: (app_id, account, cycle, pay_id ) => {
    return {
			account,
    	appId: Number(app_id),
    	payId: pay_id,
    	cycle: Number(cycle)
    };
  },

  encode: (inst) => encode('AppIncomeRedeemConfirmParams', inst)
};
