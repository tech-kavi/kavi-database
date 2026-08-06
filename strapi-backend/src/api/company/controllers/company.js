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

function normalizeName(name = "") {
  return name.toLowerCase().replace(/[\s-_]+/g, "");
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

        const normalized = normalizeName(data.name);
        
            const tags = (data.tags || "")
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean);

            // Avoid duplicates
            if (!tags.some(tag => tag.toLowerCase() === normalized)) {
            tags.push(normalized);
            }

            data.tags = tags.join(", ");

            data.creator = ctx.state.user?.username;

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

//   async find(ctx) {
//          try {
//             const { filters, populate } = ctx.query;

//             const companies = await strapi
//             .documents("api::company.company")
//             .findMany({
//                 filters,
//                 populate,
//             });

//             if (!companies || companies.length === 0) {
//             return ctx.notFound("Company not found");
//             }

//             const enrichedCompanies = await Promise.all(
//             companies.map(async (company) => {
//                 const experts = await strapi
//                 .documents("api::expert.expert")
//                 .findMany({
//                     filters: {
//                     expert_experiences: {
//                         target_company: {
//                         documentId: {
//                             $eq: company.documentId,
//                         },
//                         },
//                     },
//                     },
//                     fields: ["documentId"],
//                     limit: 10000,
//                 });

//                 const uniqueExpertIds = new Set(
//                 experts.map((expert) => expert.documentId)
//                 );

//                 return {
//                 ...company,
//                 expertCount: uniqueExpertIds.size,
//                 };
//             })
//             );

//             ctx.body = {
//             data: enrichedCompanies,
//             };
//         } catch (err) {
//             console.error("Error fetching company:", err);

//             ctx.status = 500;
//             ctx.body = {
//             error: "Internal server error",
//             };
//         }
        
//   },

  async findOne(ctx) {
  try {
    const { id: slug } = ctx.params;

    const company = await strapi
      .documents("api::company.company")
      .findFirst({
        filters: {
          comp_slug: {
            $eq: slug,
          },
        },
        populate: ctx.query.populate,
      });

    if (!company) {
      return ctx.notFound("Company not found");
    }

    const experts = await strapi
      .documents("api::expert.expert")
      .findMany({
        filters: {
          expert_experiences: {
            target_company: {
              documentId: {
                $eq: company.documentId,
              },
            },
          },
        },
        fields: ["documentId"],
        limit: 10000,
      });

    const uniqueExpertIds = new Set(
      experts.map((expert) => expert.documentId)
    );

    ctx.body = {
      data: {
        ...company,
        expertCount: uniqueExpertIds.size,
      },
    };
  } catch (err) {
    console.error("Error fetching company:", err);

    ctx.status = 500;
    ctx.body = {
      error: "Internal server error",
    };
  }
}

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
