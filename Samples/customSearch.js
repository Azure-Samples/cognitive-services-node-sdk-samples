/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const os = require("os");
const async = require('async');
const Search = require('azure-cognitiveservices-search');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let keyVar = 'AZURE_CUSTOM_SEARCH_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];


///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let customSearchApiClient = new Search.CustomSearchAPIClient(credentials);

function sample(rl) {
  rl["keepOpen"] = true;

  console.log("Please provide a customConfig number for your Custom Search.")
  rl.question('', async function (answer) {
    try {
      await runSearch(parseInt(answer));
    } catch (err) {
      console.log(err);
    }
    rl.close();
    console.log(os.EOL);
    console.log("Finished running Custom-Search sample.");
  });

  async function runSearch(customConfig) {
    console.log("1. This will look up a single query (Xbox) and print out name and url for first web result");

    let webData = await customSearchApiClient.customInstance.search("Xbox", { customConfig: customConfig });
    console.log("Searched for Query# \" Xbox \"");

    //WebPages
    if (((webData.webPages || {}).value || {}).length > 0) {
      // find the first web page
      let firstWebPagesResult = webData.webPages.value[0];

      if (firstWebPagesResult) {
        console.log(`Webpage Results#${webData.webPages.value.length}`);
        console.log(`First web page name: ${firstWebPagesResult.name} `);
        console.log(`First web page URL: ${firstWebPagesResult.url} `);
      } else {
        console.log("Couldn't find web results!");
      }
    } else {
      console.log("Didn't see any Web data..");
    }
  }
}

exports.sample = sample;
