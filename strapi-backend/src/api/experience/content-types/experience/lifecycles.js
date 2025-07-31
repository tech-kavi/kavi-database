// let expertToReindexId = null;

// module.exports = {
//   async beforeDelete(event) {
//     const experienceId = event.params.where.id;
//     if (experienceId) {
//       const experience = await strapi.entityService.findOne('api::experience.experience', experienceId, {
//         populate: { expert: true },
//       });

//       if (experience?.expert?.id) {
//         expertToReindexId = experience.expert.id;
//       }
//     }
//   },

//   async afterCreate(event) {
//     // Only reindex if Expert is already linked
//     const experience = await strapi.entityService.findOne('api::experience.experience', event.result.id, {
//       populate: { expert: true },
//     });

//     if (experience?.expert?.id) {
//       await reindexExpert(experience.expert.id);
//     }
//   },

//   async afterUpdate(event) {
//     const experienceId = event.result.id;

//     const experience = await strapi.entityService.findOne('api::experience.experience', experienceId, {
//       populate: { expert: true },
//     });

//     if (experience?.expert?.id) {
//       await reindexExpert(experience.expert.id);
//     }
//   },

//   async afterDelete(event) {
//     if (expertToReindexId) {
//       await reindexExpert(expertToReindexId);
//       expertToReindexId = null;
//     }
//   },
// };

// async function reindexExpert(expertId) {
//   if (!expertId) return;

//   await strapi.entityService.update('api::expert.expert', expertId, {
//     data: {
//        updatedAt: new Date()
//        },
//   });



//   strapi.log.info(`Triggered re-index for Expert ID: ${expertId}.`);
// }
