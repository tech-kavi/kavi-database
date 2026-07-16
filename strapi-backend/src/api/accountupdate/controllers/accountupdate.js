'use strict';

/**
 * A set of functions called "actions" for `accountupdate`
 */
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const axios = require('axios');


module.exports = {
  update: async (ctx, next) => {
     try {
            const rawFiles = ctx.request.files || ctx.request.body.files;

    
      const uploadedFile =
        Array.isArray(rawFiles) ? rawFiles[0] :
        rawFiles?.files?.[0] || rawFiles?.files || rawFiles;

      if (!uploadedFile || !uploadedFile.filepath) {
        return ctx.badRequest('No valid file uploaded');
      }

      const filePath = uploadedFile.filepath;
      const originalFilename = uploadedFile.originalFilename;

      // Upload file to Strapi Upload plugin (or Supabase if you are using Supabase storage)
      const uploaded = await strapi.service('plugin::upload.upload').upload({
        data: {
          fileInfo: {
            name: originalFilename,
            caption: 'Expert Data',
          },
        },
        files: uploadedFile,
      });

      console.log("file uploaded");

        const fileId = uploaded?.[0]?.id;
      if (!fileId) {
        return ctx.internalServerError('File upload failed to generate URL.');
      }

     const file = await strapi.entityService.findOne('plugin::upload.file', fileId);
           if (!file) throw new Error('Uploaded file not found in Media Library');
     
           //console.log(file);
     
           let buffer;
     
           if (file.provider === 'local') {
             // Local provider
             const localPath = `public${file.url}`;
             buffer = fs.readFileSync(localPath);
           } else {
             // Remote provider (Supabase, S3, etc.)
             const response = await axios.get(file.url, { responseType: 'arraybuffer' });
             buffer = Buffer.from(response.data);
           }
     
           const workbook = XLSX.read(buffer, { type: 'buffer' });
     
           //const workbook = XLSX.readFile(filePath);
           const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: '',
      });

      let updated = 0;
      let notFound = [];

      for (const row of rows) {
        const code = String(row.Code || '').trim();
        const accountNumber = String(row['Account Number'] || '').trim();

        if (!code) continue;


        const projects = await strapi.entityService.findMany('api::project.project', {
        filters: { code },
        limit: -1,
      });

        console.log(projects);

        if (!projects.length) {
          notFound.push(code);
          continue;
        }

        // await strapi.documents('api::project.project').update({
        //   documentId: projects[0].documentId,
        //   data: {
        //     accountnumber: accountNumber,
        //   },
        //   status:'published',
        // });

       

        updated++;
      }

      return ctx.send({
        updated,
        notFound,
      });
    } catch (err) {
      strapi.log.error(err);

      return ctx.internalServerError(err.message);
    }
  }
};
