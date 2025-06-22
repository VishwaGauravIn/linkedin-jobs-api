import { query, IQueryOptions } from "./index";
import * as assert from "assert";

console.log("Running type-check tests...");

const testTypeCheck = async () => {
  const queryOptions: IQueryOptions = {
    keyword: "Frontend Developer",
    location: "United States",
    limit: "1", // Limit to 1 for a quick test
  };

  try {
    const jobs = await query(queryOptions);

    // 1. Check if the response is an array
    assert.strictEqual(Array.isArray(jobs), true, "Response should be an array.");
    console.log("✔ Test passed: Response is an array.");

    // If no jobs are returned, which can happen, we can't test the structure.
    if (jobs.length > 0) {
      const job = jobs[0];

      // 2. Check if the first element is an object
      assert.strictEqual(typeof job, 'object', "Job item should be an object.");
      assert.notStrictEqual(job, null, "Job item should not be null.");
      console.log("✔ Test passed: Job item is an object.");

      const expectedKeys: (keyof typeof job)[] = [
        'position',
        'company',
        'location',
        'date',
        'salary',
        'jobUrl',
        'companyLogo',
        'agoTime'
      ];

      // 3. Check for the presence of all keys
      for (const key of expectedKeys) {
        assert.strictEqual(key in job, true, `Job object should have the key: ${key}`);
      }
      console.log("✔ Test passed: Job object has all required keys.");
      
      // 4. Check if all values are strings
      for (const key of expectedKeys) {
        assert.strictEqual(typeof job[key], 'string', `Value of ${key} should be a string.`);
      }
      console.log("✔ Test passed: All job object values are strings.");

    } else {
      console.log("✔ Test skipped: No jobs returned to check structure, but this is a valid scenario.");
    }
    
    console.log("\nAll type-check tests passed successfully!");

  } catch (error) {
    console.error("Type-check tests failed:", error);
    process.exit(1); // Exit with error code
  }
};

testTypeCheck(); 