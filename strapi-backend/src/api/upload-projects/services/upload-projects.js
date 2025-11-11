'use strict';

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const slugify = require("slugify");
const moment = require("moment-timezone");
const axios = require('axios');
const { Parser } = require("json2csv");

/**
 * upload-projects service
 */

function normalizeKey(key) {
  return key.toLowerCase().replace(/[\s_]+/g, '');
}

function normalizeLinkedIn(link) {
  if (!link) return '';
  return link.trim().toLowerCase().replace(/\/+$/, '');
}

const columnMap = {
  projectcode: 'code',
  expertlinkedin: 'expertlinkedin',
  accountholdersname: 'accountholdersname',
  investor: 'investor',
  ca: 'ca',
  meetingdate: 'meetingdate',
  email: 'email',
  phone: 'phone',
  quote: 'quote',
  callduration: 'callduration',
  actualamtdue: 'actualamtdue',
  accountnumber: 'accountnumber',
  ifsc: 'ifsc',
  pan: 'pan',
  callrating:'callrating',
  expertrating:'expertrating',
  fccallrating:'fccallrating',
  fcexpertrating:'fcexpertrating',
};

function remapRow(row) {
  const newRow = {};
  for (const key in row) {
    const normalized = normalizeKey(key);
    console.log(normalized);
    const mappedKey = columnMap[normalized];
    if (mappedKey) {
      newRow[mappedKey] = row[key];
    }
  }
  return newRow;
}


function parseExcelDate(excelDate) {
  if (!excelDate) return null;

  // If it's already a JS Date
  if (excelDate instanceof Date) return excelDate;

  // If it's an Excel serial number
  if (typeof excelDate === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(excelDate);
    if (!dateObj) return null;
    return new Date(
      dateObj.y,
      dateObj.m - 1, // JS months are 0-based
      dateObj.d,
      dateObj.H,
      dateObj.M,
      dateObj.S
    );
  }

  // If it's a string like "19-09-2025"
  if (typeof excelDate === 'string') {
    const [day, month, year] = excelDate.split('-').map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    }

    // fallback: try Date constructor
    const parsed = new Date(excelDate);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null; // if all parsing fails
}

module.exports = ({strapi}) => ({
    async processProjectFileInBackground(fileId,uploaderEmail) {
        try {

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
          const rawData = XLSX.utils.sheet_to_json(sheet);
        //   console.log(rawData);
          const data = rawData.map(remapRow);
    
        //  console.log(data);

        // -------------------
      // 1. Check Excel duplicate project codes
      // -------------------
      const excelCodes = data.map((row) => row.code?.toString().trim()).filter(Boolean);
      const duplicateCodes = excelCodes.filter(
        (code, i) => excelCodes.indexOf(code) !== i
      );

      if (duplicateCodes.length > 0) {
        await strapi.plugin('email').service('email').send({
          to: uploaderEmail,
          subject: 'Fail - Final Tracker Upload',
          html: `
            <h2>Upload Failed</h2>
            <p>The following project codes are duplicated inside your Excel file:</p>
            <ul>${[...new Set(duplicateCodes)].map((c) => `<li>${c}</li>`).join('')}</ul>
            <p>Please remove duplicates and try again.</p>
          `,
        });
        return;
      }

            // -------------------
      // 2. Check project codes already in DB
      // -------------------
      const existingProjects = await strapi.entityService.findMany('api::project.project', {
        fields: ['code'],
        filters: { code: { $in: excelCodes } },
        limit: -1,
      });

      if (existingProjects.length > 0) {
        const existingCodes = existingProjects.map((p) => p.code);
        await strapi.plugin('email').service('email').send({
          to: uploaderEmail,
          subject: 'Fail - Final Tracker Upload',
          html: `
            <h2>Upload Failed</h2>
            <p>The following project codes already exist in the system:</p>
            <ul>${existingCodes.map((c) => `<li>${c}</li>`).join('')}</ul>
            <p>Please fix your file and try again.</p>
          `,
        });
        return;
      }

       // -------------------
      // 3. LinkedIn check (your existing logic)
      // -------------------

            
        const excelLinkedins = Array.from(
        new Set(
            data
            .map((row) => normalizeLinkedIn(row.expertlinkedin))
            .filter((v) => v) // remove empty
        )
        );
    
          const matchedExperts = await strapi.entityService.findMany('api::expert.expert', {
            fields: ['id', 'linkedin', 'documentId'],
            filters: { linkedin: { $in: excelLinkedins } },
            limit:-1,
          });

            const foundLinkedins = matchedExperts.map((e) => normalizeLinkedIn(e.linkedin));

            // 3. Check missing
           const missing = excelLinkedins.filter((l) => !foundLinkedins.includes(l));

          
              if (missing.length > 0) {
                // ❌ Send ONE failure mail with all missing LinkedIns
                await strapi.plugin('email').service('email').send({
                  to: uploaderEmail,
                  subject: 'Fail - Final Tracker Upload',
                  html: `
                    <h2>Upload Failed</h2>
                    <p>The following LinkedIn accounts were not found in our system:</p>
                    <ul>${missing.map((l) => `<li>${l}</li>`).join('')}</ul>
                    <p>Please add them first or correct your file and try again.</p>
                  `,
                });
                return; // stop here
              }

             const expertMap = new Map(
                matchedExperts.map((e) => [normalizeLinkedIn(e.linkedin), e])
            );

           
    
          const slugify = (str) =>
            str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

          let created = 0;
const affectedExpertIds = new Set();
const failedRows = []; // 🔴 to capture failed rows

for (let index = 0; index < data.length; index++) {
  const row = data[index];
  try {
    const {
      code,
      expertlinkedin,
      accountholdersname,
      investor,
      ca,
      meetingdate,
      email,
      phone,
      quote,
      callduration,
      actualamtdue,
      accountnumber,
      ifsc,
      pan,
      callrating,
      expertrating,
      fccallrating,
      fcexpertrating,
    } = row;

    const slug = slugify(code);
    const linkedinKey = normalizeLinkedIn(expertlinkedin);
    const expert = expertMap.get(linkedinKey);

    if (!expert) {
      failedRows.push({ index: index + 2, reason: 'Expert not found', code, expertlinkedin });
      continue;
    }

    // Update expert details if needed
    const updateData = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    if (Object.keys(updateData).length > 0) {
      await strapi.documents('api::expert.expert').update({
        documentId: expert.documentId,
        data: updateData,
        status: 'published',
      });
    }

    // Create project
    await strapi.entityService.create('api::project.project', {
      data: {
        code,
        pro_slug: slug,
        investor: investor || null,
        ca: ca || null,
        date: parseExcelDate(meetingdate),
        final_amount: actualamtdue || null,
        duration: callduration || null,
        account_number: accountnumber || null,
        account_holder_name: accountholdersname || null,
        ifsc: ifsc || null,
        pan: pan || null,
        call_rating: callrating || 0,
        expert_rating: expertrating || 0,
        fc_call_rating: fccallrating || 0,
        fc_expert_rating: fcexpertrating || 0,
        quote: quote || 0,
        expert: expert.documentId,
      },
    });

    affectedExpertIds.add(expert.id);
    created++;

  } catch (err) {
    console.error(`❌ Error at row ${index + 2}:`, err.message);
    failedRows.push({ index: index + 2, reason: err.message, code: row.code });
    continue;
  }
}

// ✅ Reindex only experts that succeeded
if (affectedExpertIds.size > 0) {
  const expertIdsArray = Array.from(affectedExpertIds);
  setTimeout(async () => {
    try {
      await strapi.service('api::upload-experts.upload-experts').indexExpertsToAlgolia(expertIdsArray);
      strapi.log.info('✅ Final tracker algolia indexing completed.');
    } catch (err) {
      strapi.log.error('❌ Final tracker algolia indexing failed:', err);
    }
  }, 0);
}

// 📧 Send summary email
let html = `<h2>Final Tracker Upload Summary</h2>`;
html += `<p><strong>Projects Created:</strong> ${created}</p>`;

if (failedRows.length > 0) {
  html += `<h3>Failed Rows (${failedRows.length})</h3><ul>`;
  for (const fail of failedRows) {
    html += `<li>Row ${fail.index} (Code: ${fail.code || 'N/A'}): ${fail.reason}</li>`;
  }
  html += `</ul>`;
}

await strapi.plugin('email').service('email').send({
  to: uploaderEmail,
  subject:
    failedRows.length > 0
      ? `Partial Success - Final Tracker Upload`
      : `Success - Final Tracker Upload`,
  html,
});

    
        } catch (error) {
          console.error('❌ Background Processing Error:', error);
    
            await strapi.plugin('email').service('email').send({
            to: uploaderEmail,
            subject: 'Fail - Final Tracker Upload',
            html: `
              <h2>Upload Failed</h2>
              <p>We were unable to process your Excel file.</p>
              <p><strong>Error:</strong> ${error.message}</p>
              <p>Please fix the file and try again.</p>
            `,
          });
        }
        finally{
      await strapi.service('api::upload-lock.upload-lock').releaseLock();
    }
      },

  
})

