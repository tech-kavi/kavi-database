'use strict';

/**
 * experience controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::experience.experience', ({ strapi }) => ({

  async update(ctx) {

    try {



      const exp_slug = ctx.params.id; // ← This is actually your `documentId`
      const body = ctx.request.body?.data || ctx.request.body;

      //console.log(body);

      const allowedFields = [
        'designation',
        'type',
        'start_date',
        'end_date',
        'source_of_response',
        'engagement_status',
        'quote',
      ];

      const updateData = {};

      const numericFields = ['quote', 'original_quote', 'credits'];

      allowedFields.forEach((field) => {
        let value = body[field];

        if (value !== undefined) {
          if (typeof value === 'string') {
            value = value.trim();
          }

          // Convert empty string for numbers → null
          if (numericFields.includes(field) && value === '') {
            value = null;
          }

          // Convert to number if it's a valid number string
          if (numericFields.includes(field) && value !== null) {
            value = Number(value);
            if (isNaN(value)) value = null;
          }

          // Convert empty string for dates → null
          if ((field === 'start_date' || field === 'end_date') && value === '') {
            value = null;
          }

          // Only set the field if it's not undefined
          updateData[field] = value;
        }
      });

      // ✅ Handle relation update
    if (body.target_company) {
      updateData.target_company = {
        connect: [{ documentId: body.target_company }],
      };
    }

    // Optional: handle company if you make it editable too
    if (body.company) {
      updateData.company = body.company.trim();
    }

    if (body.sub_industry) {
      updateData.sub_industry = {
        connect: [{ documentId: body.sub_industry }],
      };
    }

      // Skip update if no valid fields provided
      if (Object.keys(updateData).length === 0) {
        return ctx.badRequest('No valid fields to update.');
      }

      const experienceDetails = await strapi.db.query('api::experience.experience').findOne({
            where: { exp_slug: exp_slug },
          });

      console.log(updateData);

      const updatedExperience = await strapi.documents('api::experience.experience').update({
        documentId:experienceDetails.documentId,
        data: updateData,
        populate: ['expert'],
        status: 'published',
      });

      console.log(updatedExperience);

      const expertId = updatedExperience.expert?.documentId;
      if (!expertId) {
        return ctx.badRequest('User not found for the given experience');
      }

      // ✅ Update last_update of expert
      const now = new Date();
      const lastUpdate = {
        name: ctx.state.user?.username || "system",
        time: now.toISOString(),
        field: "Updated Experience",
      };

      const updatedExpert = await strapi.documents('api::expert.expert').update({
        documentId: expertId,
        data: {
          last_update: lastUpdate,
        },
          populate: {
          expert_experiences: {
            populate: {
              target_company: true,
              sub_industry: true, 
            },
          },
          projects: true,
          companies: true,
          last_update: true,
        },
        status: 'published',
      });

     

      const sanitizedExpert = await this.sanitizeOutput(updatedExpert, ctx);
      // console.log(sanitizedExpert);

      setTimeout(async () => {
        await strapi.service('api::upload-experts.upload-experts').indexExpertsToAlgolia();
        strapi.log.info('Background task completed.');
      }, 0);

      return ctx.send(sanitizedExpert);

    } catch (err) {
      console.log(err);
    }

  }



}));
