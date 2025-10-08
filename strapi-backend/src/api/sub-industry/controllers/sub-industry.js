'use strict';

/**
 * sub-industry controller
 */
function generateSlug(name) {
  return name
    .toLowerCase()                // lowercase
    .replace(/[\s]+/g, '-')       // spaces → hyphen
    .replace(/[^\w-]+/g, '')      // remove non-alphanumeric/hyphen
    .replace(/--+/g, '-')         // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens
}

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::sub-industry.sub-industry',({strapi}) => ({
    async create(ctx) {
        try {
        const { data } = ctx.request.body;

        if (!data) {
            return ctx.badRequest('Missing "data" in request body');
        }

        // 🔑 Auto-generate slug if not provided
        if (!data.ind_slug && data.name) {
            data.ind_slug = generateSlug(data.name);
        }

        // ✅ Create the industry using Document Service (Strapi v5)
        const createdIndustry = await strapi.documents('api::sub-industry.sub-industry').create({
            data,
            status: 'published',
        });

        return createdIndustry;
        } catch (err) {
        strapi.log.error('Industry create error:', err);
        return ctx.badRequest(err.message);
        }
  },
}));
