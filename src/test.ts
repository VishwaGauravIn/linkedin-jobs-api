import { query, IQueryOptions } from "./index";

const queryOptions: IQueryOptions = {
  location: "India",
  dateSincePosted: "past week",
  jobType: "full time",
  remoteFilter: "remote",
  salary: "100000",
  experienceLevel: "entry level",
  limit: "1",
  sortBy: "recent",
  page: "1",
};

query(queryOptions).then((response) => {
  console.log(response);
});
