module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/companies-data',
     handler: 'companies-data.find',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
