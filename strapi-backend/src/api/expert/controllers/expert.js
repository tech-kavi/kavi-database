// @ts-nocheck
'use strict';

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

const slugify = require('slugify');

function cleanData(body) {
  const cleanedData = {};
  for (const key in body) {
    if (
      body[key] !== '' &&
      body[key] !== null &&
      body[key] !== undefined
    ) {
      cleanedData[key] = body[key];
    }
  }
  return cleanedData;
}

module.exports = createCoreController('api::expert.expert', ({ strapi }) => ({

  async create(ctx){

    try {
  const { expertData, experiences, projects } = ctx.request.body;

  // Clean expert data
  const cleanedExpertData = cleanData(expertData);

  // Ensure slug exists for Expert
  if (!cleanedExpertData.slug) {
    const baseSlug =
      cleanedExpertData.name || cleanedExpertData.email || 'expert';
    cleanedExpertData.slug = slugify(baseSlug, {
      lower: true,
      strict: true,
    });
  }

  // Step 1: Create Expert
  const expert = await strapi.documents('api::expert.expert').create({
    data: cleanedExpertData,
    status: 'published',
  });

  // Step 2: Create Experiences (if any)
  if (experiences && experiences.length > 0) {
    for (const exp of experiences) {
      const cleanedExp = cleanData(exp);

      // Ensure slug for Experience
      if (!cleanedExp.slug) {
        const baseSlug =
          cleanedExp.title || cleanedExp.role || `experience-${expert.documentId}`;
        cleanedExp.slug = slugify(baseSlug, {
          lower: true,
          strict: true,
        });
      }

      await strapi.documents('api::experience.experience').create({
        data: {
          ...cleanedExp,
          expert: expert.documentId,
        },
        status: 'published',
      });
    }
  }

  // Step 3: Create Projects (if any)
  if (projects && projects.length > 0) {
    for (const proj of projects) {
      const cleanedProj = cleanData(proj);

      // Ensure slug for Project
      if (!cleanedProj.slug) {
        const baseSlug =
          cleanedProj.name || cleanedProj.title || `project-${expert.documentId}`;
        cleanedProj.slug = slugify(baseSlug, {
          lower: true,
          strict: true,
        });
      }

      await strapi.documents('api::project.project').create({
        data: {
          ...cleanedProj,
          expert: expert.documentId,
        },
        status: 'published',
      });
    }
  }

  // Step 4: Return expert with populated relations
  const fullExpert = await strapi.documents('api::expert.expert').findOne({
    documentId: expert.documentId,
    populate: ['expert_experiences', 'projects', 'companies'],
  });

  setTimeout(async () => {
          await strapi.service('api::upload-experts.upload-experts').indexSingleExpert(fullExpert.documentId);
          strapi.log.info('Background task completed.');
        }, 0);

  return fullExpert;
} catch (error) {
  console.error('Error creating expert:', error);
  ctx.throw(500, error);
}

  },

  async update(ctx) {
    
     try{

        const slug = ctx.params.id;
         const body = ctx.request.body?.data || ctx.request.body;

        console.log(body);

        // console.log(slug);
        // Filter out empty values
          const cleanedData = {};
          for (const key in body) {
            if (body[key] !== '' && body[key] !== null && body[key] !== undefined) {
              cleanedData[key] = body[key];
            }
          }

          const expertDetails = await strapi.db.query('api::expert.expert').findOne({
            where: { slug: slug },
          });

         // console.log(expertDetails);

         const now = new Date();

         cleanedData.last_update = {
          name: ctx.state.user?.username || "system",   // or email / id from logged in user
          time: now.toISOString(),
          field: "Expert",   // track which fields were updated
        };

        const updatedExpert = await strapi.documents('api::expert.expert').update({
            documentId:expertDetails.documentId,
            data: cleanedData,
            populate:{
              expert_experiences:{
                populate:['company','target_company','sub_industry']
              },
              projects:true,
              last_update:true,
            },
            status: 'published',
          });

         // console.log(updatedExpert);


        const sanitizedExpert = await this.sanitizeOutput(updatedExpert, ctx);
       // console.log(sanitizedExpert);
        
        await strapi.service('api::upload-experts.upload-experts').indexSingleExpert(sanitizedExpert.documentId);

        // setTimeout(async () => {
        //   await strapi.service('api::upload-experts.upload-experts').indexSingleExpert(sanitizedExpert.documentId);
        //   strapi.log.info('Background task completed.');
        // }, 0);

        return ctx.send(sanitizedExpert);
        
    }catch(err){
        console.log(err);
    }
  

  },
}));
