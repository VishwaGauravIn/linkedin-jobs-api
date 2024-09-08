<div align="center">
 <h1> <img src="https://www.freepnglogos.com/uploads/linkedin-logo-design-30.png" width="80px"><br/>LinkedIn Jobs API</h1>
 <a href="https://itsvg.in" target="_blank"><img src="https://img.shields.io/badge/Creator-Vishwa%20Gaurav-blue"/></a> 
 <img src="https://img.shields.io/npm/v/linkedin-jobs-api?label=%20"/>
 <img src="https://img.shields.io/npm/dt/linkedin-jobs-api">
 <img src="https://img.shields.io/snyk/vulnerabilities/github/VishwaGauravIn/linkedin-jobs-api"/>
 <img src="https://img.shields.io/badge/License-GPL%20v3-brightgreen"/>
 <img src="https://img.shields.io/github/languages/code-size/VishwaGauravIn/linkedin-jobs-api?logo=github">
</div>

## Features

- ⚡ Lightening Fast
- ✨ Minimal
- 🪶 Lightweight
- 🔥 Advanced Filters
- 🤩 Support all Frameworks

## How to Install ?

Use npm or yarn to install this npm package

```
npm i linkedin-jobs-api
```

or

```
yarn add linkedin-jobs-api
```

Include the package

```
const linkedIn = require('linkedin-jobs-api');
```

Basic Example:

```
const linkedIn = require('linkedin-jobs-api');

const queryOptions = {
  keyword: 'software engineer',
  location: 'India',
  dateSincePosted: 'past Week',
  jobType: 'full time',
  remoteFilter: 'remote',
  salary: '100000',
  experienceLevel: 'entry level',
  limit: '10',
  page: "0",
};

linkedIn.query(queryOptions).then(response => {
	console.log(response); // An array of Job objects
});
```

## Query Object Parameters

query() accepts a _queryOptions_ object and returns an array of _Job_ objects.

|    Parameter    | LinkedIn Default value |                                                Description                                                |
| :-------------: | :--------------------: | :-------------------------------------------------------------------------------------------------------: |
|     keyword     |           ""           |                         _string_ - The text to search: (i.e. Software Developer)                          |
|    location     |           ""           |                            _string_ - The name of the city: (i.e. Los Angeles)                            |
| dateSincePosted |           ""           |                      _string_ - Max range of jobs: `past month`, `past week`, `24hr`                      |
|     jobType     |           ""           | _string_ - Type of position: `full time`, `part time`, `contract`, `temporary`, `volunteer`, `internship` |
|  remoteFilter   |           ""           |                      _string_ - Filter telecommuting: `on site`, `remote`, `hybrid`                       |
|     salary      |           ""           |                 _string_ - Minimum Salary: `40000`, `60000`, `80000`, `100000`, `120000`                  |
| experienceLevel |           ""           |          _string_ - `internship`, `entry level`, `associate`, `senior`, `director`, `executive`           |
|      limit      |           ""           |                     _string_ - Number of jobs returned: (i.e. '1', '10', '100', etc)                      |
|     sortBy      |           ""           |                                      _string_ - `recent`, `relevant`                                      |
|     page      |           "0"           |                                      _string_ - `0`, `1`, `2` ....                                      |
## Job Objects

|  Paramter   |     Description (Default: null)     |
| :---------: | :---------------------------------: |
|  position   |      _string_ - Position title      |
|   company   |       _string_ - Company name       |
| companyLogo |       _string_ - Company Logo       |
|  location   |   _string_ - Location of the job    |
|    date     | _string_ - Date the job was posted  |
|   agoTime   | _string_ - time since it was posted |
|   salary    |       _string_ - Salary range       |
|   jobUrl    |   _string_ - URL of the job page    |

## Example Response

```json
[
  {
    "position": "Human Resources Administrator",
    "company": "The Hub",
    "companyLogo": "https://static.licdn.com/aero-v1/sc/h/9a9u41thxt325ucfh5z8ga4m8",
    "location": "India",
    "date": "2023-11-20",
    "agoTime": "2 days ago",
    "salary": "",
    "jobUrl": "https://in.linkedin.com/jobs/view/human-resources-administrator-at-the-hub-3765436573?refId=rWSjK9izzZ1ZNnUZYzqp8Q%3D%3D&trackingId=X6uox0Xk%2FRQmqkuHpO%2BdrQ%3D%3D&position=1&pageNum=0&trk=public_jobs_jserp-result_search-card"
  }
]
```

## Our Sponsor
<a href="https://nubela.co/proxycurl?utm_campaign=influencer_marketing&utm_source=github&utm_medium=social&utm_content=vishwagauravin_linkedin-jobs-api" target="_blank"><img src="https://github.com/VishwaGauravIn/linkedin-jobs-api/assets/81325730/afe16626-f05e-421b-a054-6aef1d1aec10" width="200px"/></a>

Scrape public LinkedIn profile data at scale with [Proxycurl APIs](https://nubela.co/proxycurl?utm_campaign=influencer_marketing&utm_source=github&utm_medium=social&utm_content=vishwagauravin_linkedin-jobs-api).

• Scraping Public profiles are battle tested in court in HiQ VS LinkedIn case.<br/>
• GDPR, CCPA, SOC2 compliant<br/>
• High rate limit - 300 requests/minute<br/>
• Fast - APIs respond in ~2s<br/>
• Fresh data - 88% of data is scraped real-time, other 12% are not older than 29 days<br/>
• High accuracy<br/>
• Tons of data points returned per profile

## Contributing

Feel free to contribute!

1. Fork the repository
2. Make changes
3. Submit a pull request
