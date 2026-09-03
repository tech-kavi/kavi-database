

'use strict';

module.exports = {
  async uploadAndCreateExperts(ctx) {
    let gotLock = null;
    try {
      const uploaderEmail = ctx.state.user?.email;

      // Try to acquire lock
    gotLock = await strapi.service('api::upload-lock.upload-lock').acquireLock(uploaderEmail);
    //console.log(gotLock);
    if (gotLock?.isLocked) {
      return ctx.badRequest(`${gotLock.lockedBy}'s upload is already in progress. Please wait until it finishes.`);
    }



      const rawFiles = ctx.request.files || ctx.request.body.files;
      const topic = ctx.request.topic || ctx.request.body.topic;

      const uploadedFile =
        Array.isArray(rawFiles) ? rawFiles[0] :
        rawFiles?.files?.[0] || rawFiles?.files || rawFiles;

      if (!uploadedFile || !uploadedFile.filepath) {
        return ctx.badRequest('No valid file uploaded');
      }

      const filePath = uploadedFile.filepath;
      const originalFilename = uploadedFile.originalFilename;

      const sanitizedFilename = originalFilename
      .normalize("NFKC")
      .replace(/\u00A0/g, " ")        // Replace non-breaking spaces
      .replace(/[^\x20-\x7E]/g, "")   // Remove other non-ASCII chars (optional)
      .trim();

    // Override the filename used by the upload provider
    uploadedFile.originalFilename = sanitizedFilename;

      // Upload file to Strapi Upload plugin (or Supabase if you are using Supabase storage)
      const uploaded = await strapi.service('plugin::upload.upload').upload({
        data: {
          fileInfo: {
            name: sanitizedFilename,
            caption: 'Expert Data',
          },
        },
        files: uploadedFile,
      });

      const fileId = uploaded?.[0]?.id;
      if (!fileId) {
        console.log('inside file upload error');
        await strapi.service('api::upload-lock.upload-lock').releaseLock(gotLock.lock.documentId);
        return ctx.internalServerError('File upload failed to generate URL.');
      }

      //Kick off background processing (non-blocking)
      setTimeout(async () => {
        try {
          await strapi.service('api::upload-experts.upload-experts').processExpertFileInBackground(fileId,uploaderEmail,topic,gotLock.lock);
          strapi.log.info('✅ Background processing completed.');
        } catch (err) {
          strapi.log.error('❌ Background processing failed:', err);
        }
      }, 0);

      return ctx.send({ message: 'File uploaded successfully. Processing will continue in background.' });

    } catch (error) {
      console.error('❌ Error:', error);
       if (gotLock?.lock?.documentId) {
      try {
        await strapi
          .service('api::upload-lock.upload-lock')
          .releaseLock(gotLock.lock.documentId);

        strapi.log.info(
          `🔓 Released lock ${gotLock.lock.documentId} after upload error`
        );
      } catch (releaseError) {
        strapi.log.error(
          '❌ Failed to release upload lock:',
          releaseError
        );
      }
    }

      return ctx.internalServerError('Failed to upload and process file');
    }
  },
};
