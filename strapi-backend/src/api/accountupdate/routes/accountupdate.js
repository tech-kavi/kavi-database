module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/accountupdate',
     handler: 'accountupdate.update',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
