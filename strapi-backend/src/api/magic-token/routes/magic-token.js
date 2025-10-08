// 'use strict';

// /**
//  * magic-token router
//  */

// const { createCoreRouter } = require('@strapi/strapi').factories;

// module.exports = createCoreRouter('api::magic-token.magic-token');
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/magic-tokens',
      handler: 'magic-token.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
    method: 'POST',
    path: '/verify',
    handler: 'magic-token.verify',
    config: {
        policies: [],
        middlewares: [],
      },
  },
  ],
};