const { encode } = require('../lib/codec');
const { convertBalance } = require('../lib/util');

module.exports = {
  create: (account, appId, payId, proposalId) => {
    return {
      account,
			appId: Number(appId),
			payId,
			proposalId
    };
  },

  encode: (inst) => encode('AppFinancedUserExchangeConfirmParams', inst)
};