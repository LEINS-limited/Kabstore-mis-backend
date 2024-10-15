// File: helloAlgolia.mjs
import { algoliasearch } from 'algoliasearch';

const appID = 'HMX2F929EI';
// API key with `addObject` and `editSettings` ACL
const apiKey = '0a4ed19fe8ef7f84cc4becdcf3a23986';
const indexName = 'product-index';

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
