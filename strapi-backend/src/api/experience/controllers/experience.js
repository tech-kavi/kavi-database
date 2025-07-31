'use strict';

/**
 * experience controller
 */

// @ts-ignore
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::experience.experience',({strapi})=>({

    async update(ctx){

        try{

          

        const documentId = ctx.params.id; // ← This is actually your `documentId`
        const body = ctx.request.body?.data || ctx.request.body;

       

          const allowedFields = [
            'designation',
            'type',
            'start_date',
            'end_date',
            'source_of_response',
            'engagement_status',
            'original_quote',
            ];

            const updateData = {};

            allowedFields.forEach((field) => {
            const value = body[field];

            // Treat empty string as "do not update"
            if (value !== undefined && value !== '') {
                updateData[field] =
                (field === 'start_date' || field === 'end_date') && value === ''
                    ? null
                    : value;
            }
            });

              // Skip update if no valid fields provided
      if (Object.keys(updateData).length === 0) {
        return ctx.badRequest('No valid fields to update.');
      }

    const updatedExperience = await strapi.documents('api::experience.experience').update({
        documentId,
        data: updateData,
        populate: ['expert'],
        status: 'published',
      });

    console.log(updatedExperience);
    
const expertId = updatedExperience.expert?.documentId;
if (!expertId) {
  return ctx.badRequest('User not found for the given experience');
}


const expert = await strapi.documents('api::expert.expert').findOne({
  documentId:expertId,
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
