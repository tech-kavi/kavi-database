'use strict';

/**
 * upload-lock service
 */

// @ts-ignore
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = ({ strapi }) => ({
     async acquireLock(userEmail) {

    const existingLocks = await strapi.entityService.findMany('api::upload-lock.upload-lock',{
      filters: { islocked: true },
      limit:1,
    });

    const existingLock = existingLocks[0]||null;

  //console.log(existingLock);

    if (existingLock) {
      return {isLocked:true,lockedBy:existingLock?existingLock.locked_by:null}; // Lock already taken
    }

    // Otherwise create/update a lock
    const lock = await strapi.entityService.create('api::upload-lock.upload-lock',{
      data: {
        islocked: true,
        locked_by: userEmail,
        lockedAt: new Date()
      }
    });

    return {isLocked:false};
  },

  async releaseLock() {
    await strapi.db
      .query('api::upload-lock.upload-lock')
      .updateMany({
        where: { islocked: true },
        data: { islocked: false },
      });
      }
});
