'use strict';

module.exports = (plugin) => {
  plugin.controllers.user.me = async (ctx) => {
    // Your custom logic here
    const userId = ctx.state.user?.id;
      if (!userId) return ctx.unauthorized('User not authenticated');

      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        populate: { role: true }, // ✅ populate role
      });

      return user;
  };

  return plugin;
};
