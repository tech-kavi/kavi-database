'use strict';

/**
 * A set of functions called "actions" for `customupdate`
 */

module.exports = {
  customupdate: async (ctx, next) => {
    try {
        const { upload_file_details, target_company } =
          ctx.request.body?.data || ctx.request.body || {};

        // -----------------------------
        // Validate input
        // -----------------------------
        if (!upload_file_details || !String(upload_file_details).trim()) {
          return ctx.badRequest('upload_file_details is required');
        }

        if (!target_company || !String(target_company).trim()) {
          return ctx.badRequest('target_company is required');
        }

        const uploadFileDetails = String(upload_file_details).trim();
        const targetCompanyName = String(target_company).trim();

        // -----------------------------
        // Find target company
        // Case-insensitive
        // -----------------------------
        const companies = await strapi.entityService.findMany(
          'api::company.company',
          {
            fields: ['id', 'name', 'documentId'],
            filters: {
              name: {
                $eqi: targetCompanyName,
              },
            },
            limit: 1,
          }
        );

        if (!companies.length) {
          return ctx.notFound(
            `Company "${targetCompanyName}" was not found`
          );
        }

        const targetCompany = companies[0];
        console.log(targetCompany);

        // -----------------------------
        // Find all experiences
        // with same upload_file_details
        // -----------------------------
        const experiences = await strapi.entityService.findMany(
          'api::experience.experience',
          {
            fields: ['id', 'documentId', 'upload_file_details'],
            filters: {
              upload_file_details: {
                $eq: uploadFileDetails,
              },
               target_company: {
              $null: true,
            },
            },
            populate: {
              expert: {
                fields: ['documentId'],
                populate:{
                  companies:{
                    fields:['documentId'],
                  },
                },
              },
            },
            limit: -1,
          }
        );

        if (!experiences.length) {
          return ctx.notFound(
            `No experiences found for upload_file_details "${uploadFileDetails}"`
          );
        }

        console.log(experiences.length);

        // -----------------------------
        // Collect unique expert IDs
        // -----------------------------
        const affectedExperts = new Set();

        for (const experience of experiences) {
          if (experience.expert?.documentId) {
            affectedExperts.add(experience.expert.documentId);
          }
        }

        // -----------------------------
        // Update ONLY target_company
        // -----------------------------
        let updatedCount = 0;

        for (const experience of experiences) {
          await strapi.documents(
            'api::experience.experience'
          ).update({
            documentId: experience.documentId,
            data: {
              target_company: targetCompany.documentId,
            },
            status: 'published',
          });

            // Add target company to expert's companies relation
          const expert = experience.expert;

          if (expert?.documentId) {
            const existingCompanies = expert.companies || [];

            const alreadyHasCompany = existingCompanies.some(
              company => company.documentId === targetCompany.documentId
            );

            if (!alreadyHasCompany) {
              await strapi.documents(
                'api::expert.expert'
              ).update({
                documentId: expert.documentId,
                data: {
                  companies: [
                    ...existingCompanies.map(company => company.documentId),
                    targetCompany.documentId,
                  ],
                },
                status: 'published',
              });
            }
          }

          updatedCount++;
        }

        const affectedExpertIds = Array.from(affectedExperts);

        console.log(affectedExpertIds);

        // -----------------------------
        // Reindex affected experts
        // -----------------------------
        if (affectedExpertIds.length > 0) {
          setTimeout(async () => {
            try {
              await strapi
                .service('api::upload-experts.upload-experts')
                .indexExpertsToAlgolia(affectedExpertIds);

              strapi.log.info(
                `✅ Algolia reindex completed for ${affectedExpertIds.length} experts`
              );
            } catch (err) {
              strapi.log.error(
                '❌ Background Algolia indexing failed:',
                err
              );
            }
          }, 0);
        }

        // -----------------------------
        // Response
        // -----------------------------
        return ctx.send({
          success: true,
          message: 'Target company updated successfully',
          upload_file_details: uploadFileDetails,
          target_company: {
            documentId: targetCompany.documentId,
            name: targetCompany.name,
          },
          experiences_found: experiences.length,
          experiences_updated: updatedCount,
          experts_affected: affectedExpertIds.length,
          expert_document_ids: affectedExpertIds,
        });

      } catch (error) {
        strapi.log.error(
          '❌ Fix target company error:',
          error
        );

        return ctx.internalServerError(
          'Failed to update target company'
        );
      }
  },
};
