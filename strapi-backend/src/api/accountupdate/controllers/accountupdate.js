'use strict';

/**
 * A set of functions called "actions" for `accountupdate`
 */
const XLSX = require('xlsx');

module.exports = {
  update: async (ctx, next) => {
     try {
      const { files } = ctx.request;

      if (!files?.file) {
        return ctx.badRequest('Excel file is required.');
      }

      const workbook = XLSX.readFile(files.file.filepath);
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

        const projects = await strapi.documents('api::project.project').findMany({
          filters: {
            code,
          },
        });

        if (!projects.length) {
          notFound.push(code);
          continue;
        }

        await strapi.documents('api::project.project').update({
          documentId: projects[0].documentId,
          data: {
            account_number: accountNumber,
          },
        });

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
