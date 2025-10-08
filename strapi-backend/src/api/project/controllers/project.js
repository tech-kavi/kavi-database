// @ts-nocheck
'use strict';

const slugify = require('slugify');

/**
 * project controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::project.project',({strapi})=>({
    async create(ctx){

      try{

          
            const body = ctx.request.body?.data || ctx.request.body;

        // Filter out empty values
          const cleanedData = {};
          for (const key in body) {
            if (body[key] !== '' && body[key] !== null && body[key] !== undefined) {
              cleanedData[key] = body[key];
            }
          }

          // ✅ Generate slug from name/title (use whichever field exists)
      if (cleanedData.code || cleanedData.ca) {
        const baseText = cleanedData.code || cleanedData.ca;
        cleanedData.pro_slug = slugify(baseText, {
          lower: true,
          strict: true, // removes special chars
        });
      }

      const expertDetails = await strapi.db.query('api::expert.expert').findOne({
        where: { slug: body.expert },
      });

      // console.log(expertDetails);

      cleanedData.expert=expertDetails.id;

        const createdProject = await strapi.documents('api::project.project').create({
            data: cleanedData,
            status: 'published',
          });

          // ✅ Update last_update of expert
      const now = new Date();
      const lastUpdate = {
        name: ctx.state.user?.username || "system",
        time: now.toISOString(),
        field: "Project Added",
      };

      const updatedExpert = await strapi.documents('api::expert.expert').update({
        documentId: expertDetails.documentId,
        data: {
          last_update: lastUpdate,
        },
        populate: '*',     // ✅ populate relations if you need them
        status: 'published',
      });


        const sanitizedExpert = await this.sanitizeOutput(updatedExpert, ctx);
        // console.log(sanitizedExpert);

        setTimeout(async () => {
          await strapi.service('api::upload-experts.upload-experts').indexExpertsToAlgolia();
          strapi.log.info('Background task completed.');
        }, 0);

        return ctx.send(sanitizedExpert);
        
    }catch(err){
        console.log(err);
    }
  
    },

    async update(ctx){
      try {
      const pro_slug = ctx.params.id; // this is exp_slug equivalent
      const body = ctx.request.body?.data || ctx.request.body;

      // Define allowed fields for projects
      const allowedFields = [
        'code',
        'investor',
        'ca',
        'expert_rating',
        'fc_call_rating',
        'fc_expert_rating',
        'call_rating',
        'date',
        'final_amount',
      ];

      const updateData = {};
      allowedFields.forEach((field) => {
        const value = body[field];
        if (value !== undefined && value !== '') {
          updateData[field] =
            (field === 'date') && value === ''
              ? null
              : value;
        }
      });

      if (Object.keys(updateData).length === 0) {
        return ctx.badRequest('No valid fields to update.');
      }

      console.log(updateData);

      
      const projectDetails = await strapi.db.query('api::project.project').findOne({
            where: { pro_slug: pro_slug },
          });

      if (!projectDetails) {
        return ctx.notFound('Project not found');
      }

      // ✅ perform update
      const updatedProject = await strapi
        .documents('api::project.project')
        .update({
          documentId: projectDetails.documentId,
          data: updateData,
          populate: ['expert'],
          status: 'published',
        });

      // ✅ update expert last_update
      const expertId = updatedProject.expert?.documentId;
      if (!expertId) {
        return ctx.badRequest('Expert not found for the given project');
      }

      const now = new Date();
      const lastUpdate = {
        name: ctx.state.user?.username || 'system',
        time: now.toISOString(),
        field: 'Updated Project',
      };

      const updatedExpert = await strapi
        .documents('api::expert.expert')
        .update({
          documentId: expertId,
          data: { last_update: lastUpdate },
          populate: '*',
          status: 'published',
        });

      const sanitizedExpert = await this.sanitizeOutput(updatedExpert, ctx);

      // ✅ background index to Algolia
      setTimeout(async () => {
        await strapi
          .service('api::upload-experts.upload-experts')
          .indexExpertsToAlgolia();
        strapi.log.info('Background task completed.');
      }, 0);

      return ctx.send(sanitizedExpert);
    } catch (err) {
      strapi.log.error('Error in project update:', err);
      return ctx.internalServerError('Something went wrong');
    }
    }

}));
