// File: helloAlgolia.mjs
import { algoliasearch } from 'algoliasearch';
import * as dotenv from 'dotenv';
dotenv.config();

const appID = process.env.ALGOLIA_APP_ID;
// API key with `addObject` and `editSettings` ACL
const apiKey = process.env.ALGOLIA_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME;

const client = algoliasearch(appID, apiKey);


// Add record to an index
export const saveObject = async (record:any)=>{
    const { taskID } = await client.saveObject({
    indexName,
    body: record,
    });

    await client.waitForTask({
      indexName,
      taskID,
    });
}

export const search = async ()=>{
    const { results } = await client.search({
    requests: [
        {
        indexName,
        query: 'test',
        },
    ],
    });

    console.log(JSON.stringify(results));
}
