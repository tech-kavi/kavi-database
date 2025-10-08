module.exports = {
  routes: [
    {
     method: 'POST',
     path: '/upload-projects',
     handler: 'upload-projects.createproject',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
