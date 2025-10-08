module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/expert-details',
     handler: 'dashboard.expertDetails',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
     method: 'GET',
     path: '/recent-experts-count',
     handler: 'dashboard.recentExperts',
     config: {
       policies: [],
       middlewares: [],
     },
    },

  ],
};
