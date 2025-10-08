'use strict';

/**
 * A set of functions called "actions" for `reindex-experts`
 */

module.exports = {
  async reindex(ctx){
    try {

            setTimeout(async () => {
        try {
          await strapi.service('api::upload-experts.upload-experts').indexExpertsToAlgoliaAll();
          console.log('✅ Background algolia indexing completed.');
        } catch (err) {
         console.log('❌ Background algolia indexin failed:', err);
        }
      }, 0);
          ctx.send({ message: 'Re-indexing completed successfully.' });
        } catch (err) {
          console.error('Reindex Experts Failed:', err);
          ctx.throw(500, 'Internal Server Error');

        }
  }
};
