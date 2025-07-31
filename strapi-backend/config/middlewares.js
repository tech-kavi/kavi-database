module.exports = [
  'strapi::logger',
  'strapi::errors',
  // {
  //       name: 'strapi::security',
  //       config: {
  //         contentSecurityPolicy: {
  //           useDefaults: true,
  //           directives: {
  //             'connect-src': ["'self'", 'https:'],
  //             'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
  //             'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
  //             upgradeInsecureRequests: null,
  //           },
  //         },
  //       },
  //     },
  {
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'blob:', 'https://aagnonkvpgrxpkrahsco.supabase.co'],
      },
    },
  },
},
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
