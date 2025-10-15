// @ts-nocheck
'use strict';

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const moment = require("moment-timezone");
const axios = require('axios');


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

function normalizeKey(key) {
  return key.toLowerCase().replace(/[\s_-]+/g, '');
}

function normalizeLinkedIn(link) {
  if (!link) return '';
  return link.trim().toLowerCase().replace(/\/+$/, '');
}

const columnMap = {
  sheetname: 'SheetName',
  linkedinlink: 'LinkedIn',
  name: 'Name',
  targetcompany: 'Topic',
  topic: 'TargetCompany',
  type: 'Type',
  experttype: 'Type',
  companyname: 'CompanyName',
  designation: 'Designation',
  startdate: 'Start',
  enddate: 'End',
  tags: 'Tags',
  comments: 'Comments',
  email: 'Email',
  contactnumber: 'Phone',
  originalquote:'originalquote',
  negotiatedquote:'negotiatedquote',
  sourceofresponse:'sourceofresponse',
  screening:'screening',
  notes:'notes',
  status:'status',
  industry:'industry',
};

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

function getLinkedInUsername(link) {
  if (!link) return Math.random().toString(36).substring(2, 10);;
  try {
    const url = new URL(link.trim());
    const parts = url.pathname.split('/').filter(Boolean); // remove empty
    const username = parts[parts.length - 1]; // last part
    return username.toLowerCase();
  } catch (e) {
    return Math.random().toString(36).substring(2, 10);;
  }
}

const TYPE_ENUM = ["Former", "Competitor", "Customer", "Partner", "Industry Expert"];
const ENGAGEMENT_ENUM = [
  "Uncontacted",
  "No response",
  "Contacted but not screened",
  "Contacted & screened",
  "Sent to client",
  "Negotiation",
  "Contacted but ghosting",
  "Six mos rule",
  "Out of budget",
  "NDA",
  "Not interested at all",
  "Not interested in project",
  "Call scheduled",
  "Call done",
  "Call again"
];

const SOR=[
  "Cold call",
  "LinkedIn",
  "E-mail",
  "Reference",
  "Others"
]



module.exports = ({ strapi }) => ({

  async deleteSingleExpertFromAlgolia(documentId) {

const strapiAlgolia = strapi.plugin('strapi-algolia');
  const { applicationId, apiKey } = strapi.config.get('plugin::strapi-algolia');

  const algoliaService = strapiAlgolia.service('algolia');
   const strapiService = strapiAlgolia.service('strapi');
  const algoliaClient = await algoliaService.getAlgoliaClient(applicationId, apiKey);

  const contentTypeName = 'api::expert.expert';
      const indexName = 'development_api::expert.expert';  // your Algolia index name
      const idPrefix = '';
      const hideFields = [];
      const transformToBooleanFields = [];


  // Fetch the expert including experiences
 const expert = await strapi.documents('api::expert.expert').findOne({
  documentId,
  populate: {
    expert_experiences: { populate: ['target_company'] },
    projects: true,
    companies: true,
    last_update: true,
  },
  status:'published',
});

// const expert=experts[0];
// console.log(expert);

  if (!expert) {
    strapi.log.warn(`Expert with ID ${documentId} not found for Algolia deletion.`);
    return;
  }

  // Build objectIDs to delete
  let objectIDs = [];
  if (expert?.expert_experiences?.length) {
    objectIDs = expert.expert_experiences.map(exp => `${expert.slug}_${exp.exp_slug}`);
  } else {
    objectIDs = [`${expert.slug}_noexp`];
  }

  //console.log(objectIDs);

  // Delete from Algolia
    if (objectIDs.length > 0) {
      // Use plugin service to delete objects
        await strapiAlgolia.service('algolia').createOrDeleteObjects(
          [],              // no objects to save
          objectIDs,       // objectIDs to delete
          algoliaClient,
          indexName
        );

        strapi.log.info(`Deleted objectIDs [${objectIDs.join(', ')}] from Algolia.`);
    }
},



  async indexSingleExpert(documentId) {
  const strapiAlgolia = strapi.plugin('strapi-algolia');
  const { applicationId, apiKey } = strapi.config.get('plugin::strapi-algolia');

  const algoliaService = strapiAlgolia.service('algolia');
   const strapiService = strapiAlgolia.service('strapi');
  const client = await algoliaService.getAlgoliaClient(applicationId, apiKey);

  const contentTypeName = 'api::expert.expert';
      const indexName = 'development_api::expert.expert';  // your Algolia index name
      const idPrefix = '';
      const hideFields = [];
      const transformToBooleanFields = [];

  

   const expert = await strapi.documents('api::expert.expert').findOne({
          documentId:documentId,
          populate:{
            expert_experiences:{
              populate:['company','target_company','sub_industry']
            },
            projects:true,
            companies:true,
            last_update:true,
          },
          status:'published',
        });

        // console.log(expert);
        if (!expert) return;

  // Transform expert into Algolia record(s)
const transformedExperts = expert.expert_experiences?.length
  ? expert.expert_experiences.map(exp => ({
      objectID: `${expert.slug}_${exp.exp_slug}`,
      slug: expert.slug,
      expertId: expert.id,
      name: expert.name,
      email: expert.email,
      linkedin: expert.linkedin,
      phone: expert.phone,
      tags:expert.tags,
      last_update:expert.last_update,
      original_quote: expert.original_quote,
      expert_status:expert.expert_status,
      source_of_response:expert.source_of_response,
      notes:expert.notes,
      project: expert.projects,
      ...exp,
      company: exp.company,
      target_company: exp.target_company ? { id: exp.target_company.id, name: exp.target_company.name } : null,
      sub_industry: exp.sub_industry ? { id: exp.sub_industry.id, name: exp.sub_industry.name, ind_slug:exp.sub_industry.ind_slug } : null,
      start_date_ts: exp.start_date ? Math.floor(new Date(exp.start_date).getTime() / 1000) : 0,
      end_date_ts: exp.end_date ? Math.floor(new Date(exp.end_date).getTime() / 1000) : 0,
    }))
  : [{
      objectID: `${expert.slug}_noexp`,
      slug: expert.slug,
      expertId: expert.id,
      name: expert.name,
      email: expert.email,
      linkedin: expert.linkedin,
      phone: expert.phone,
      tags:expert.tags,
      original_quote: expert.original_quote,
      createdAt: expert.createdAt,
      updatedAt: expert.updatedAt,
    }];

  
    await strapiService.afterUpdateAndCreateAlreadyPopulate(
      contentTypeName,
      transformedExperts,
      idPrefix,
      client,
      indexName,
      transformToBooleanFields,
      hideFields,
    );
  

  strapi.log.info(`Expert ${expert.slug} indexed/updated in Algolia.`);

  
},

async indexExpertsToAlgoliaAll() {
    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const { applicationId, apiKey, contentTypes, indexPrefix = "", transformerCallback } = strapi.config.get('plugin::strapi-algolia');

    const algoliaService = strapiAlgolia.service('algolia');
    const strapiService = strapiAlgolia.service('strapi');

    const client = await algoliaService.getAlgoliaClient(applicationId, apiKey);


      const contentTypeName = 'api::expert.expert';
      const indexName = 'development_api::expert.expert';  // your Algolia index name
      const idPrefix = '';
      const hideFields = [];
      const transformToBooleanFields = [];

      let start=0;
      const limit=100;
      let allExperts=[];


      while (true) {
        const expertsBatch = await strapi.documents('api::expert.expert').findMany({
          populate: { expert_experiences: { populate: ['target_company','sub_industry'] }, projects: true, companies: true, last_update: true },
          status: 'published',
          start: start,
          limit: limit,
        });


        if (expertsBatch.length===0) break;
        allExperts = allExperts.concat(expertsBatch);
        start += limit;
      }




      const transformedExperts = allExperts.flatMap(expert => {
  if (expert.expert_experiences?.length>0) {
    return expert.expert_experiences.map(exp => ({
      objectID: `${expert.slug}_${exp.exp_slug}`,  // unique record
      slug: expert.slug,                   // for distinct
      expertId: expert.id,
      name: expert.name,
      email: expert.email,
      tags:expert.tags,
      last_update:expert.last_update,
      expert_status:expert.expert_status,
      source_of_response:expert.source_of_response,
      notes:expert.notes,
      linkedin: expert.linkedin,
      phone: expert.phone,
      original_quote: expert.original_quote,
      project:expert.projects,

      // spread all fields from experience (so you keep createdAt, updatedAt, etc.)
      ...exp,

      // normalize relations inside exp
      company: exp.company,
      target_company: exp.target_company
        ? { id: exp.target_company.id, name: exp.target_company.name, comp_slug:exp.target_company.comp_slug }
        : null,

        sub_industry: exp.sub_industry ? { id: exp.sub_industry.id, name: exp.sub_industry.name, ind_slug:exp.sub_industry.ind_slug } : null,

      // Add timestamps as numeric fields (for easier range filters/sorting)
      start_date_ts: exp.start_date
        ? Math.floor(new Date(exp.start_date).getTime() / 1000)
        : 0,
      end_date_ts: exp.end_date
        ? Math.floor(new Date(exp.end_date).getTime() / 1000)
        : 0,
    }));
  }

  // fallback when no experiences exist
  return [{
    objectID: `${expert.slug}_noexp`,
    slug: expert.slug,
    expertId: expert.id,
    name: expert.name,
    email: expert.email,
    tags:expert.tags,
    linkedin: expert.linkedin,
    phone: expert.phone,
    original_quote: expert.original_quote,
    createdAt: expert.createdAt,
    updatedAt: expert.updatedAt,
  }];
});

     
    await strapiService.afterUpdateAndCreateAlreadyPopulate(
      contentTypeName,
      transformedExperts,
      idPrefix,
      client,
      indexName,
      transformToBooleanFields,
      hideFields,
      transformerCallback
    );

    strapi.log.info(`Algolia re-indexing completed for Experts.`);
  },

  async indexExpertsToAlgolia(expertIds = []) {
    const strapiAlgolia = strapi.plugin('strapi-algolia');
    const { applicationId, apiKey, contentTypes, indexPrefix = "", transformerCallback } = strapi.config.get('plugin::strapi-algolia');

    const algoliaService = strapiAlgolia.service('algolia');
    const strapiService = strapiAlgolia.service('strapi');

    const client = await algoliaService.getAlgoliaClient(applicationId, apiKey);


      const contentTypeName = 'api::expert.expert';
      const indexName = 'development_api::expert.expert';  // your Algolia index name
      const idPrefix = '';
      const hideFields = [];
      const transformToBooleanFields = [];

      

      const allExperts = await strapi.documents('api::expert.expert').findMany({
        filters:{id:{$in: expertIds}},
          populate:{
            expert_experiences:{
              populate:['target_company','sub_industry']
            },
            projects:true,
            companies:true,
            last_update:true,
          },
          status:'published',
          limit:-1,
        });


      const transformedExperts = allExperts.flatMap(expert => {
  if (expert.expert_experiences?.length>0) {
    return expert.expert_experiences.map(exp => ({
      objectID: `${expert.slug}_${exp.exp_slug}`,  // unique record
      slug: expert.slug,                   // for distinct
      expertId: expert.id,
      name: expert.name,
      email: expert.email,
      tags:expert.tags,
      last_update:expert.last_update,
      expert_status:expert.expert_status,
      source_of_response:expert.source_of_response,
      notes:expert.notes,
      linkedin: expert.linkedin,
      phone: expert.phone,
      original_quote: expert.original_quote,
      project:expert.projects,

      // spread all fields from experience (so you keep createdAt, updatedAt, etc.)
      ...exp,

      // normalize relations inside exp
      company: exp.company,
      target_company: exp.target_company
        ? { id: exp.target_company.id, name: exp.target_company.name, comp_slug:exp.target_company.comp_slug }
        : null,

      sub_industry: exp.sub_industry ? { id: exp.sub_industry.id, name: exp.sub_industry.name, ind_slug:exp.sub_industry.ind_slug } : null,

      // Add timestamps as numeric fields (for easier range filters/sorting)
      start_date_ts: exp.start_date
        ? Math.floor(new Date(exp.start_date).getTime() / 1000)
        : 0,
      end_date_ts: exp.end_date
        ? Math.floor(new Date(exp.end_date).getTime() / 1000)
        : 0,
    }));
  }

  // fallback when no experiences exist
  return [{
    objectID: `${expert.slug}_noexp`,
    slug: expert.slug,
    expertId: expert.id,
    name: expert.name,
    email: expert.email,
    tags:expert.tags,
    linkedin: expert.linkedin,
    phone: expert.phone,
    original_quote: expert.original_quote,
    createdAt: expert.createdAt,
    updatedAt: expert.updatedAt,
  }];
});

     
    await strapiService.afterUpdateAndCreateAlreadyPopulate(
      contentTypeName,
      transformedExperts,
      idPrefix,
      client,
      indexName,
      transformToBooleanFields,
      hideFields,
      transformerCallback
    );

    strapi.log.info(`Algolia re-indexing completed for Experts.`);
  },





   async processExpertFileInBackground(fileId,uploaderEmail,topic) {
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
      const data = rawData.map(remapRow);

      //console.log(uploaderEmail);

      const errors = [];

      //checking errors
      data.forEach((row, index) => {
        const { Name, LinkedIn, Type, source_of_response, Designation, CompanyName, status,industry,SheetName } = row;

        if (!SheetName) errors.push(`Row ${index + 2}: Sheet Name is missing`);
        if (!Name) errors.push(`Row ${index + 2}: Name is missing`);
        if (!LinkedIn) errors.push(`Row ${index + 2}: LinkedIn is missing`);
        if (!Type || !TYPE_ENUM.includes(Type)) errors.push(`Row ${index + 2}: Invalid Type`);
        if (status && !ENGAGEMENT_ENUM.includes(status.trim())) {
          errors.push(`Row ${index + 2}: Invalid status`);
        }
        if (source_of_response && !SOR.includes(source_of_response.trim())) {
          errors.push(`Row ${index + 2}: Invalid source of response`);
        }
        if (!Designation) errors.push(`Row ${index + 2}: Designation is missing`);
        if (!CompanyName) errors.push(`Row ${index + 2}: CompanyName is missing`);
        if(!industry) error.push(`Row ${index + 2}: Industry is missing`)
      });

      if (errors.length > 0) {
        await strapi.plugin('email').service('email').send({
          to: uploaderEmail,
          subject: 'Upload Failed - Validation Errors',
          html: `<p>Errors found before processing:</p><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>`
        });
        //throw new Error('Validation failed.');
        const err = new Error('Validation failed.');
        // @ts-ignore
        err.alreadyNotified = true; // 🔑 avoid duplicate email
        throw err;
      }


       // 🔑 Create unique code
        const timestamp = moment().tz("Asia/Kolkata").format("YYYYMMDD-HHmmss"); 
        const sanitizedEmail = uploaderEmail.split("@")[0];   // part before @
        const sanitizedTopic = topic.toLowerCase().replace(/\s+/g, "-");

        const uniqueCode = `${sanitizedTopic}-${sanitizedEmail}-${timestamp}`;
        
       // strapi.log.info(`📌 Upload Code (IST): ${uniqueCode}`);

       const linkedinKeys = data.map(row=>normalizeLinkedIn(row.LinkedIn)).filter(Boolean);

      const allExperts = await strapi.entityService.findMany('api::expert.expert', {
        fields: ['id', 'linkedin', 'documentId','tags','ra_comments','source_of_response','original_quote','screening','notes'],
        filters:{linkedin:{$in:linkedinKeys}},
        limit:linkedinKeys.length,
      });

    
      const expertMap = new Map(allExperts.map(e => [normalizeLinkedIn(e.linkedin), e]));

      const allIndustriesInExcel = new Set();
      data.forEach(row=>{
        if(row.industry) allIndustriesInExcel.add(row.industry.trim());
      });

      const industriesArray = Array.from(allIndustriesInExcel);

      const allindustries = await strapi.entityService.findMany('api::sub-industry.sub-industry', {
        fields: ['id', 'name'],
        filters:{
          name:{$in: industriesArray},
        },
      });

      const industryMap = new Map(allindustries.map(c=>[c.name.trim(),c]));

      const missingIndustries=[];
      const existingIndustries=[];

      industriesArray.forEach(name => {
        if (industryMap.has(name)) {
          existingIndustries.push(industryMap.get(name));
        } else {
          missingIndustries.push(name);
        }
      });


      //if any company not found
      if (missingIndustries.length > 0) {
        console.log('Companies missing in collection:', missingIndustries);

         await strapi.plugin('email').service('email').send({
          to: uploaderEmail,
          subject: 'Upload Failed - Missing Companies',
          html: `
            <h2>Upload Failed</h2>
            <p>The following companies from your Excel file are <strong>not present</strong> in the system:</p>
            <ul>
              ${missingIndustries.map(c => `<li>${c}</li>`).join('')}
            </ul>
            <p>Please add these companies to the collection and try again.</p>
          `,
        });

        
      //throw new Error(`Missing companies`);
              const err = new Error('Missing SubIndustries');
            err.alreadyNotified = true; // 🔑 avoid duplicate email
            throw err;
        
      }



      const allCompanyNamesInExcel = new Set();
      data.forEach(row=>{
        if(row.TargetCompany) allCompanyNamesInExcel.add(row.TargetCompany.trim());
      });

      const companyNamesArray = Array.from(allCompanyNamesInExcel);
      //console.log(companyNamesArray);

      const allCompanies = await strapi.entityService.findMany('api::company.company', {
        fields: ['id', 'name'],
        filters:{
          name:{$in: companyNamesArray},
        },
      });



      //console.log(allCompanies);

      const companyMap = new Map(allCompanies.map(c => [c.name.trim(), c]));

      // 4️⃣ Check missing companies
      const missingCompanies = [];
      const existingCompanies = [];

      companyNamesArray.forEach(name => {
        if (companyMap.has(name)) {
          existingCompanies.push(companyMap.get(name));
        } else {
          missingCompanies.push(name);
        }
      });

      //if any company not found
      if (missingCompanies.length > 0) {
        console.log('Companies missing in collection:', missingCompanies);

         await strapi.plugin('email').service('email').send({
          to: uploaderEmail,
          subject: 'Upload Failed - Missing Companies',
          html: `
            <h2>Upload Failed</h2>
            <p>The following companies from your Excel file are <strong>not present</strong> in the system:</p>
            <ul>
              ${missingCompanies.map(c => `<li>${c}</li>`).join('')}
            </ul>
            <p>Please add these companies to the collection and try again.</p>
          `,
        });

        
      //throw new Error(`Missing companies`);
              const err = new Error('Missing companies');
            err.alreadyNotified = true; // 🔑 avoid duplicate email
            throw err;
        
      }


      const slugify = (str) =>
        str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    


      let created = 0;
      let updated = 0;

      let sheetNamesList = [];

      // Atomic DB Transaction
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
              Tags,
              Comments,
              original_quote,
              negotiatedquote,
              sourceofresponse,
              screening,
              notes,
              status,
              Phone,
              originalquote,
              Email,
              industry,
            } = row;

            if (SheetName) sheetNamesList.push(SheetName.trim());

          const parseTags = Tags =>
            String(Tags || '')
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);

            if (!Name || !LinkedIn) continue;

            const slug = getLinkedInUsername(LinkedIn);
            const linkedinKey = normalizeLinkedIn(LinkedIn);
            let expert = expertMap.get(linkedinKey);
            const company = CompanyName?.trim();
            const targetCompany = companyMap.get(TargetCompany?.trim());
            const foundindustry = industryMap.get(industry?.trim());
            const expSlug = slugify(`${Designation}-${CompanyName}-${Start ? new Date(Start).getTime() : Date.now()}`);

            if (expert) {

               let updateData = {};

               if (Tags) {
              const newTags = parseTags(Tags);
              updateData.tags = [...new Set([...(expert.tags || []), ...newTags])];
              }

              // Only update comments if Excel has comments
                if (Comments) {
              updateData.ra_comments = [Comments, expert.ra_comments]
              .filter(Boolean)
              .join('\n');
              }

              if(original_quote){
              updateData.original_quote=original_quote;
              }

              if(sourceofresponse)
              {
                updateData.source_of_response=sourceofresponse.trim();
              }

              if(screening)
              {
                const prevScreening = expert.screening ? String(expert.screening) : "";

                  updateData.screening = [screening?.trim(), prevScreening]
                .filter(Boolean) // remove empty values
                .join("\n");     // newline-separated
              }

              if(notes)
              {
                const prevNotes = expert.notes ? String(expert.notes) : "";

                  updateData.notes = [notes?.trim(), prevNotes]
                .filter(Boolean) // remove empty values
                .join("\n");     // newline-separated
              }

                // 👉 persist tags/comments if present
              if (Object.keys(updateData).length > 0) {
                await strapi.documents('api::expert.expert').update({
                    documentId: expert.documentId,
                    data: updateData,
                    status: 'published',   // publish in one go
                    trx,
                  });
              }

              await strapi.entityService.create('api::experience.experience', {
                data: {
                  exp_slug: expSlug,
                  type: Type,
                  designation: Designation,
                  start_date: parseExcelDate(Start),
                  end_date: parseExcelDate(End),
                  upload_file_details: SheetName,
                  company: company,
                  target_company: targetCompany?.documentId || null,
                  expert: expert.documentId,
                  quote:negotiatedquote,
                  engagement_status:status ? status.trim() : null,
                  sub_industry:foundindustry?.documentId||null,
                },
                trx,
              });

              updated++;
            } else {

              const newExpert = await strapi.entityService.create('api::expert.expert', {
                data: {
                  name: Name,
                  linkedin: LinkedIn,
                  phone:String(Phone || '').trim(),
                  slug,
                  email:Email,
                  companies: targetCompany?.id,
                  tags: parseTags(Tags),
                  ra_comments:Comments||null,
                  original_quote:originalquote,
                  source_of_response:sourceofresponse ? sourceofresponse.trim() : null,
                  expert_status:status ? status.trim() : null,
                  screening: screening? screening.trim():"",
                  notes:notes? notes.trim():"",
                },
                trx,
              });

              expertMap.set(linkedinKey, newExpert);

              await strapi.entityService.create('api::experience.experience', {
                data: {
                  exp_slug: expSlug,
                  type: Type,
                  designation: Designation,
                  start_date: parseExcelDate(Start),
                  end_date: parseExcelDate(End),
                  upload_file_details: SheetName,
                  company: company,
                  target_company: targetCompany?.id || null,
                  quote:negotiatedquote,
                  engagement_status: status ? status.trim() : null,
                  expert: newExpert.documentId,
                  sub_industry:foundindustry?.documentId||null,
                },
                trx,
              });

              created++;
            }
          } catch (err) {
            console.error(`❌ Error at row ${index + 2}:`, row);
            throw err; // triggers rollback
          }
        }
      });

      const affectedExpertIds = Array.from(expertMap.values()).map(e => e.id);

     

      // Trigger Algolia reindex
      // await strapi.service('api::upload-experts.upload-experts').indexExpertsToAlgolia(affectedExpertIds);

      setTimeout(async () => {
        try {
          await strapi.service('api::upload-experts.upload-experts').indexExpertsToAlgolia(affectedExpertIds);
          strapi.log.info('✅ Background algolia indexing completed.');
        } catch (err) {
          strapi.log.error('❌ Background algolia indexin failed:', err);
        }
      }, 0);

      const sheetNamesHtml = sheetNamesList.length
  ? `<p><strong>Sheet Names Found:</strong></p>
     <ul>${sheetNamesList.map(name => `<li>${name}</li>`).join('')}</ul>`
  : `<p><em>No sheet names detected in rows.</em></p>`;

      await strapi.plugin('email').service('email').send({
      to: uploaderEmail,
      subject: 'Expert Upload Result',
      html: `
        <h2>Upload Completed</h2>
        <p>Your Excel file has been processed successfully.</p>
        <ul>
          <li>✅ Experts Created: ${created}</li>
          <li>🔄 Experts Updated: ${updated}</li>
        </ul>
        ${sheetNamesHtml}
        <p>If you notice any errors, please recheck your file.</p>
      `,
    });

      strapi.log.info(`✅ Processing Completed. Created: ${created}, Updated: ${updated}`);

    } catch (error) {
      console.error('❌ Background Processing Error:', error);

       if (!error.alreadyNotified) {
      await strapi.plugin('email').service('email').send({
        to: uploaderEmail,
        subject: 'Expert Upload Failed',
        html: `
          <h2>Upload Failed</h2>
          <p>We were unable to process your Excel file.</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Please fix the file and try again.</p>
        `,
      });
    }
    } finally{
      await strapi.service('api::upload-lock.upload-lock').releaseLock();
    }
  },
});
