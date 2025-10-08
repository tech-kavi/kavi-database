'use strict';

/**
 * A set of functions called "actions" for `companies-data`
 */

module.exports = {
  find: async (ctx, next) => {
    try {

      const { search = '', page = 1, pageSize = 20 } = ctx.query;

      // Convert to numbers
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 20;
      const start = (pageNum - 1) * pageSizeNum;

      // Build filters
      const filters = search
        ? {
            $or: [
              { name: { $containsi: search } },
              { tags: { $containsi: search } },
            ],
          }
        : {};

      // Query companies
      const companies = await strapi.documents("api::company.company").findMany({
        filters,
        start,
        limit: pageSizeNum,
        orderBy: { name: "asc" },
        populate: ["experts"],
      });

      // Count total
      const total = await strapi.documents("api::company.company").count({
        filters,
      });

      // Add expert count
      // const enrichedCompanies = await Promise.all(
      //   companies.map(async (company) => {
      //     const expertCount = await strapi.documents("api::expert.expert").count({
      //       filters: {
      //         companies: { id: company.id },
      //       },
      //     });

      //     return {
      //       ...company,
      //       expertCount,
      //     };
      //   })
      // );

      ctx.body = {
        data: companies,
        meta: {
          page: pageNum,
          pageSize: pageSizeNum,
          total,
          pageCount: Math.ceil(total / pageSizeNum),
        },
      };
    } catch (err) {
      console.error('Error fetching companies with expert counts:', err);
      ctx.body = { error: 'Internal server error' };
      ctx.status = 500;
    }
  }
};
