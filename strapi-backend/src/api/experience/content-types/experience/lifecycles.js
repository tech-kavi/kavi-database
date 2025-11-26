// module.exports = {
//   beforeDelete(event) {
//     const { where } = event.params;
//     console.log(where);
//     const experienceId = where.documentId || where.id;
//     console.log(experienceId);

//     if (!experienceId) return;

//     strapi
//       .service('api::upload-experts.upload-experts')
//       .deleteSingleExperienceFromAlgolia(experienceId);
//   },
// };