// @ts-nocheck
'use strict';

const XLSX = require('xlsx');
const fs = require('fs');


// Convert Excel serial date to ISO string
function excelDateToISO(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
}

const parseExcelDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') return excelDateToISO(val);
  if (!isNaN(Date.parse(val))) return new Date(val).toISOString().split('T')[0];
  return null;
};

// Normalize Excel column headers
function normalizeKey(key) {
  return key.toLowerCase().replace(/[\s_]+/g, '');
}

//normalized linkedin
function normalizeLinkedIn(link) {
  if (!link) return '';
  return link.trim().toLowerCase().replace(/\/+$/, '');
}

// Map Excel columns to internal fields
const columnMap = {
  sheetname: 'SheetName',
  linkedinlink: 'LinkedIn',
  name: 'Name',
  targetcompany: 'Topic',
  topic: 'TargetCompany',
  type: 'Type',
  experttype: 'Type',
  companyname: 'CompanyName',
  company_name: 'CompanyName',
  designation: 'Designation',
  startdate: 'Start',
  enddate: 'End',
  tags: 'Tags',
  racomments: 'Comments',
  comments: 'Comments',
  emails: 'Email',
  contactnumber: 'Phone',
  contact: 'Phone',
};

// Remap each row to match internal format
function remapRow(row) {
  const newRow = {};
  for (const key in row) {
    const normalized = normalizeKey(key);
    const mappedKey = columnMap[normalized];
    if (mappedKey) {
      newRow[mappedKey] = row[key];
    }
  }
  return newRow;
}

module.exports = {
  async uploadAndCreateExperts(ctx) {
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

      // Remove existing uploaded files with same name
      const existingFiles = await strapi.entityService.findMany('plugin::upload.file', {
        filters: { name: originalFilename },
      });

      for (const file of existingFiles) {
        await strapi.entityService.delete('plugin::upload.file', file.id);
      }

      await strapi.service('plugin::upload.upload').upload({
        data: {
          fileInfo: {
            name: originalFilename,
            caption: 'caption',
            alternativeText: 'alternative text',
          },
        },
        files: uploadedFile,
      });

      // Parse Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet);
      const data = rawData.map(remapRow);

      const slugify = (str) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      // Preload experts and companies
      const allExperts = await strapi.entityService.findMany('api::expert.expert', {
        fields: ['id', 'linkedin', 'documentId'],
      });
      const expertMap = new Map(allExperts.map(e => [normalizeLinkedIn(e.linkedin), e]));

    const allCompanies = await strapi.entityService.findMany('api::company.company', {
        fields: ['id', 'name'],
      });
      const companyMap = new Map(allCompanies.map(c => [c.name?.toLowerCase(), c]));

      let created = 0;
      let updated = 0;

      await strapi.db.transaction(async ({ trx }) => {
        for (let index = 0; index < data.length; index++) {
          const row = data[index];


          try {
            const {
              SheetName,
              CompanyName,
              LinkedIn,
              Start,
              End,
              TargetCompany,
              Name,
              Type,
              Designation,
            } = row;

            if (!Name || !LinkedIn) continue;

            const slug = slugify(Name);
            const linkedinKey = normalizeLinkedIn(LinkedIn);
            let expert = expertMap.get(linkedinKey);
            const company = companyMap.get(CompanyName?.toLowerCase());
            const targetCompany = companyMap.get(TargetCompany?.toLowerCase());

            // 1. If expert exists
            if (expert) {
              await strapi.entityService.create('api::experience.experience', {
                data: {
                  type: Type,
                  designation: Designation,
                  start_date: parseExcelDate(Start),
                  end_date: parseExcelDate(End),
                  upload_file_details: SheetName,
                  company: company?.id || null,
                  target_company: targetCompany?.id || null,
                  expert: expert.documentId,
                },
              });

              updated++;
            } else {
              // 2. If expert does NOT exist
              console.log('creating expert');
              const newExpert = await strapi.entityService.create('api::expert.expert', {
              data: {
                name: Name,
                linkedin: LinkedIn,
                slug,
                companies: company?.id,
              },
            });

           
              expertMap.set(linkedinKey, newExpert);

              await strapi.entityService.create('api::experience.experience', {
                data: {
                  type: Type,
                  designation: Designation,
                  start_date: parseExcelDate(Start),
                  end_date: parseExcelDate(End),
                  upload_file_details: SheetName,
                  company: company?.id || null,
                  target_company: targetCompany?.id || null,
                  expert: newExpert.documentId,
                },
              });

              console.log('experience created');
              created++;
            }
          } catch (rowError) {
            console.error(`❌ Error at row ${index + 2}:`, row); // Excel rows start at 1 + header
            console.error(`   → Message:`, rowError.message);
            throw rowError; // causes full rollback
          }
        }
      });

      fs.unlinkSync(filePath); // cleanup

      // START: Trigger Algolia Indexing
      const strapiAlgolia = strapi.plugin('strapi-algolia');
      const { applicationId, apiKey, contentTypes, indexPrefix = "", transformerCallback } = strapi.config.get('plugin::strapi-algolia');

      const algoliaService = strapiAlgolia.service('algolia');
      const strapiService = strapiAlgolia.service('strapi');

      const client = await algoliaService.getAlgoliaClient(applicationId, apiKey);

      const contentTypeName = 'api::expert.expert'; // ContentType you want to index
      const contentType = contentTypes.find(ct => ct.name === contentTypeName);

      if (!contentType) {
        strapi.log.error(`Algolia ContentType config not found for ${contentTypeName}`);
      } else {
        const { index: indexNameFromConfig, idPrefix = "", populate = "*", hideFields = [], transformToBooleanFields = [] } = contentType;
        const indexName = `${indexPrefix}${indexNameFromConfig ?? contentTypeName}`;

        const allExperts = await strapi.documents('api::expert.expert').findMany({
          populate:'*',
          status:'published',
          limit:-1,
        });

      //  console.log(allExperts);

        await strapiService.afterUpdateAndCreateAlreadyPopulate(
          contentTypeName,
          allExperts,
          idPrefix,
          client,
          indexName,
          transformToBooleanFields,
          hideFields,
          transformerCallback
        );

        strapi.log.info(`Algolia re-indexing completed for Experts.`);
      }


      return {
        message: `✅ Created: ${created}, Updated: ${updated}`,
        created,
        updated,
      };
      



    } catch (error) {
      console.error('❌ Excel processing error:', error);
      return ctx.internalServerError('Failed to process Excel file');
    }
  },
};
