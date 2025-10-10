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


       //sendgrid
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: env('DEFAULT_FROM'),
        defaultReplyTo: env('DEFAULT_TO'),
      },
      
    },
  },

      'users-permissions': {
          config: {
            jwt: {
              expiresIn: '7d',
            },
          },
        },


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
      
      // ...

      //algolia

      'strapi-algolia': {
        enabled: true,
        config: {
          apiKey: env('ALGOLIA_ADMIN_KEY'),
          applicationId: env('ALGOLIA_APP_ID'),
          contentTypes: [],
          
        },
      },




    });