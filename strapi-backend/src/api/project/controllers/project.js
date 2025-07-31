'use strict';

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

        const createdProject = await strapi.documents('api::project.project').create({
            data: cleanedData,
            status: 'published',
          });

      


        const expert = await strapi.documents('api::expert.expert').findOne({
          documentId:body.expert,
          populate:'*'
        })



        const sanitizedExpert = await this.sanitizeOutput(expert, ctx);
        console.log(sanitizedExpert);

        return ctx.send(sanitizedExpert);
        
    }catch(err){
        console.log(err);
    }
  
    }
}));
