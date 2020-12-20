const { encode } = require('../lib/codec');

module.exports = {
  create: (appType, appName, appKey, appAdminKey, returnRate) => {
    return {
      appType,
      appName,
      appKey,
      appAdminKey,
      returnRate: Number(returnRate),   
    };
  },

  encode: (inst) => encode('AddAppParams', inst)
};
