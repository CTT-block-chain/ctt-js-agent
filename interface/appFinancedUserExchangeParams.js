const { encode } = require('../lib/codec');
const { convertBalance } = require('../lib/util');

module.exports = {
  create: (account, appId, proposalId, exchangeAmount) => {
    return {
      account,
			appId: Number(appId),
			proposalId,
			exchangeAmount: convertBalance(exchangeAmount),
    };
  },

  encode: (inst) => encode('AppFinancedUserExchangeParams', inst)
};