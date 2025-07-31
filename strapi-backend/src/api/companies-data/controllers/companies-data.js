'use strict';

/**
 * A set of functions called "actions" for `companies-data`
 */

module.exports = {
  find: async (ctx, next) => {
    try {
      const companies = await strapi.documents('api::company.company').findMany(
        {
          populate:['experts'],
          status:'published'
        }
      )

      console.log(companies);
      // Add expert count for each company
      const enrichedCompanies = await Promise.all(
        companies.map(async (company) => {
          const expertCount = await strapi.db.query('api::expert.expert').count({
            where: {
              companies: {
                id: {
                  $eq: company.id,
                },
              },
              publishedAt: {
                $notNull: true,
              },
            },
          });

          return {
            ...company,
            expertCount,
          };
        })
      );

      ctx.body = enrichedCompanies;
    } catch (err) {
      console.error('Error fetching companies with expert counts:', err);
      ctx.body = { error: 'Internal server error' };
      ctx.status = 500;
    }
  }
};
