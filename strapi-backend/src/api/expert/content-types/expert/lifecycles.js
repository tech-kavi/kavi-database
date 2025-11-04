
module.exports = {
  async beforeDelete(event) {
    const { params } = event;
    
    if (params?.soft) return; // ignore unpublish
    // console.log(event);

    // console.log(params);

    await strapi.service('api::upload-experts.upload-experts').deleteSingleExpertFromAlgolia(params?.where?.id);
  },
};