const { encode } = require('../lib/codec');
const { convertBalance } = require('../lib/util');

module.exports = {
  create: (deposit, member ) => {
    return {
			deposit: convertBalance(deposit),
			member
    };
  },

  encode: (inst) => encode('FinanceMemberParams', inst)
};
