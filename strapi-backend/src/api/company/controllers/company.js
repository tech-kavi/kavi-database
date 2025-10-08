// @ts-nocheck
'use strict';

const slugify = require('slugify');

/**
 * company controller
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

module.exports = createCoreController('api::company.company', ({ strapi }) => ({
     async create(ctx) {
        try {
        const { data } = ctx.request.body;

        if (!data) {
            return ctx.badRequest('Missing "data" in request body');
        }

        // 🔑 Auto-generate slug if not provided
        if (!data.comp_slug && data.name) {
            data.comp_slug = generateSlug(data.name);
        }

        // ✅ Create the company using Document Service (Strapi v5)
        const createdCompany = await strapi.documents('api::company.company').create({
            data,
            status: 'published',
        });

        return createdCompany;
        } catch (err) {
        strapi.log.error('Company create error:', err);
        return ctx.badRequest(err.message);
        }
  },

//   async update(ctx) {
//     const { data } = ctx.request.body;

//     // Optional: regenerate slug if title changes and no slug is provided
//     if (!data.slug && data.title) {
//       // @ts-ignore
//       data.slug = slugify(data.title, { lower: true });
//     }

//     const response = await super.update(ctx);
//     return response;
//   }
}));
