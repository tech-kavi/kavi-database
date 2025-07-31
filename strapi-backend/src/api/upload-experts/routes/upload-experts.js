module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/upload-experts',
      handler: 'upload-experts.uploadAndCreateExperts',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

