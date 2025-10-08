'use strict';

/**
 * upload-lock router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::upload-lock.upload-lock');
