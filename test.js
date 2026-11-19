const linkedIn = require("./index");

const queryOptions = {
  keyword: "",
  location: "India",
  dateSincePosted: "past Week",
  jobType: "full time",
  remoteFilter: "remote",
  salary: "100000",
  experienceLevel: "entry level",
  limit: "1",
  sortBy: "recent",
  page: "1",
  has_verification: false,
  under_10_applicants: false,
  includeDescriptions: true
}

linkedIn.query(queryOptions).then((response) => {
  console.log(response); // An array of Job objects
});
