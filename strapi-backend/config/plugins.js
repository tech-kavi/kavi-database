    module.exports = ({ env }) => ({
      // ...
      // upload: {
      //   config: {
      //     provider: 'cloudinary',
      //     providerOptions: {
      //       cloud_name: env('CLOUDINARY_NAME'),
      //       api_key: env('CLOUDINARY_KEY'),
      //       api_secret: env('CLOUDINARY_SECRET'),
      //     },
      //     actionOptions: {
      //       upload: {},
      //       delete: {},
      //     },
      //   },
      // },


      upload: {
  config: {
    provider: 'strapi-provider-upload-supabase',
    providerOptions: {
      apiUrl: env('SUPABASE_API_URL'),
      apiKey: env('SUPABASE_API_KEY'),
      bucket: env('SUPABASE_BUCKET'),
      directory: env('SUPABASE_DIRECTORY'),
      options: {}
    },
    breakpoints: {
      xlarge: 1920,
      large: 1000,
      medium: 750,
      small: 500,
      xsmall: 64,
    },
  },
},
      'component-filters': {
        enabled: true,
        resolve: './src/plugins/component-filters'
      },
      // ...

      //algolia

      'strapi-algolia': {
        enabled: true,
        config: {
          apiKey: env('ALGOLIA_ADMIN_KEY'),
          applicationId: env('ALGOLIA_APP_ID'),
          contentTypes: [
            { name: 'api::expert.expert' },
          ],
          // transformerCallback: (contentType, entry, operation) => {
          //   if (contentType === 'api::expert.expert') {

          //     // For indexing, skip unpublished
          //     if (!entry.publishedAt) return null;

          //     return {
          //       ...entry,
          //       objectID: entry.slug,
          //     };
          //   }
          // }
        },
      },




    });