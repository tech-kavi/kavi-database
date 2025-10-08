'use strict';

/**
 * magic-token service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::magic-token.magic-token');
