module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/accountupdate',
     handler: 'accountupdate.update',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
