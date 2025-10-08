'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    strapi.documents.use(async (context, next) => {
      const { uid, action, params } = context;

      // console.log(action);
      // console.log(params);

      if (uid === 'api::expert.expert' && action === 'delete') {
        const id = params?.documentId;
        if (id) {
          await strapi
            .service('api::upload-experts.upload-experts')
            .deleteSingleExpertFromAlgolia(id);
        }
      }

      return next();
    });
  },
};
