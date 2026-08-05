module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/customupdate',
     handler: 'customupdate.customupdate',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
