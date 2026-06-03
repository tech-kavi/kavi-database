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

    if (from || to) {
      filters.last_update.time = {
        ...(from ? { $gte: new Date(from + "T00:00:00.000Z") } : {}),
        ...(to ? { $lte: new Date(to + "T23:59:59.999Z") } : {}),
      };
    }

    const pageNum = Number(page);
    const limit = Number(pageSize);
    const start = (page-1)*limit;

  const data = await strapi.documents("api::expert.expert").findMany({
  filters,
  sort:'last_update.time:desc',
  limit,
  start,
  populate: {
    last_update: true,
    expert_experiences: true,
  },
});



const total = await strapi.documents("api::expert.expert").count({
  filters,
});

return {
  data,
  pagination: {
    start,
    limit,
    total,
    page: Math.floor(start / limit) + 1,
    pageCount: Math.ceil(total / limit),
  },
};

  } catch (err) {
    return ctx.badRequest(err.message);
  }
}
};
