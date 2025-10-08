'use strict';

/**
 * upload-lock controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::upload-lock.upload-lock');
