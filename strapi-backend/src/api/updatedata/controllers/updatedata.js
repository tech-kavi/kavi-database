'use strict';

/**
 * A set of functions called "actions" for `updatedata`
 */

module.exports = {
  find: async (ctx, next) => {
    try {
    const { from, to, page = 1, pageSize = 10 } = ctx.query;

    const filters = {
      last_update: {
        time: {
          $notNull: true,
        },
      },
    };

    // ✅ Add date range filter if provided
    if (from || to) {
      filters.last_update.time = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
        $notNull: true,
      };
    }

    const experts = await strapi.db.query('api::expert.expert').findMany({
      where: filters,
      orderBy: {
        last_update: {
          time: 'desc',
        },
      },
      offset: (page - 1) * pageSize,
      limit: pageSize,
      populate: {
        last_update: true,
        expert_experiences:true,
      },
    });

    // optional: total count for pagination UI
    const total = await strapi.db.query('api::expert.expert').count({
      where: filters,
    });

    return {
      data: experts,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        pageCount: Math.ceil(total / pageSize),
      },
    };
  } catch (err) {
    return ctx.badRequest(err.message);
  }
  }
};
