'use strict';

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::expert.expert', ({ strapi }) => ({
  async update(ctx) {
    
     try{

          const documentId = ctx.params.id;
         const body = ctx.request.body?.data || ctx.request.body;

        // Filter out empty values
          const cleanedData = {};
          for (const key in body) {
            if (body[key] !== '' && body[key] !== null && body[key] !== undefined) {
              cleanedData[key] = body[key];
            }
          }

        const updatedExpert = await strapi.documents('api::expert.expert').update({
            documentId,
            data: cleanedData,
            populate:'*',
            status: 'published',
          });

  


        const sanitizedExpert = await this.sanitizeOutput(updatedExpert, ctx);
        console.log(sanitizedExpert);

        return ctx.send(sanitizedExpert);
        
    }catch(err){
        console.log(err);
    }
  

  },
}));
