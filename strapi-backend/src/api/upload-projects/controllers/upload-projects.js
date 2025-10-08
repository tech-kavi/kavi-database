'use strict';

/**
 * A set of functions called "actions" for `upload-projects`
 */

module.exports = {
  createproject: async (ctx, next) => {
    try {
      const rawFiles = ctx.request.files || ctx.request.body.files;

     const uploaderEmail = ctx.state.user?.email;
      const uploadedFile =
        Array.isArray(rawFiles) ? rawFiles[0] :
        rawFiles?.files?.[0] || rawFiles?.files || rawFiles;

      if (!uploadedFile || !uploadedFile.filepath) {
        return ctx.badRequest('No valid file uploaded');
      }

      const filePath = uploadedFile.filepath;
      const originalFilename = uploadedFile.originalFilename;

      // Upload file to Strapi Upload plugin (or Supabase if you are using Supabase storage)
      await strapi.service('plugin::upload.upload').upload({
        data: {
          fileInfo: {
            name: originalFilename,
            caption: 'Expert Data',
          },
        },
        files: uploadedFile,
      });

      // Kick off background processing (non-blocking)
      setTimeout(async () => {
        try {
          await strapi.service('api::upload-projects.upload-projects').processProjectFileInBackground(filePath,uploaderEmail);
          strapi.log.info('✅ Background processing completed.');
        } catch (err) {
          strapi.log.error('❌ Background processing failed:', err);
        }
      }, 0);

      return ctx.send({ message: 'File uploaded successfully. Processing will continue in background.' });

    } catch (error) {
      console.error('❌ Error:', error);
      return ctx.internalServerError('Failed to upload and process file');
    }
  }
};
