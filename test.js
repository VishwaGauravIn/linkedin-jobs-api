const linkedIn = require('./index');

const queryOptions = {
    keyword: 'software engineer',
    location: 'los angeles',
    dateSincePosted: 'past Week',
    jobType: 'full time',
    remoteFilter: 'remote',
    salary: '100000',
    experienceLevel: 'entry level',
    limit: '1',
    sortBy: 'recent'
  };
  
  linkedIn.query(queryOptions).then(response => {
      console.log(response); // An array of Job objects
  });