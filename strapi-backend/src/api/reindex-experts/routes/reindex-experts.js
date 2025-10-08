module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/reindex-experts',
     handler: 'reindex-experts.reindex',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
