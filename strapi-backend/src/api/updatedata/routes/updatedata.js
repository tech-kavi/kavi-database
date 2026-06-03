module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/updatedata',
     handler: 'updatedata.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
