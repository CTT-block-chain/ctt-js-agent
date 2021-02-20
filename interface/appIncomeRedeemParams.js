const { encode } = require('../lib/codec');
const { convertBalance } = require('../lib/util');

module.exports = {
  create: (app_id, account, cycle, exchange_amount ) => {
    return {
			account,
    	appId: Number(app_id),
    	cycle: Number(cycle),
    	exchangeAmount: convertBalance(exchange_amount)
    };
  },

  encode: (inst) => encode('AppIncomeRedeemParams', inst)
};
