const { encode } = require('../lib/codec');

/**
 *  admin: AuthAccountId,
    app_id: u32,
    member: Account,
 */
module.exports = {
  create: (app_id, admin, member ) => {
    return {
			admin,
			appId: Number(app_id),
			member			
    };
  },

  encode: (inst) => encode('AppKeyManageParams', inst)
};
