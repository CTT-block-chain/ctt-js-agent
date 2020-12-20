const { encode } = require('../lib/codec');

module.exports = {
  create: (account, appId, proposalId, exchange, amount) => {
    return {
      account,
      appId: Number(appId),
      proposalId,
      exchange: convertBalance(exchange),
      amount: convertBalance(amount),    
    };
  },

  encode: (inst) => encode('AppFinancedProposalParams', inst)
};
