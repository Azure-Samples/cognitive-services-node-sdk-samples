/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const os = require("os");
const async = require('async');
const Language = require('azure-cognitiveservices-language');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let keyVar = 'AZURE_SPELL_CHECK_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];


///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let spellCheckApiClient = new Language.SpellCheckAPIClient(credentials);

function sample() {
  async.series([
    async function () {
      console.log("1. This will do a search for a misspelled query and parse the response");

      let result = await spellCheckApiClient.spellChecker({
        text: "Bill Gatas",
        mode: "proof"
      });
      console.log("Correction for Query# \"bill gatas\"");

      // SpellCheck Results
      if (result.flaggedTokens.length > 0)
      {
        // find the first spellcheck result
        let firstspellCheckResult = result.flaggedTokens[0];

        if (firstspellCheckResult) {
          console.log(`SpellCheck Results#${result.flaggedTokens.length}`);
          console.log(`First SpellCheck Result token: ${firstspellCheckResult.token}`);
          console.log(`First SpellCheck Result Type: ${firstspellCheckResult.type}`);
          console.log(`First SpellCheck Result Suggestion Count: ${firstspellCheckResult.suggestions.length}`);

          let suggestions = firstspellCheckResult.suggestions;
          if (suggestions.length > 0)
          {
            let firstSuggestion = suggestions[0];
            console.log(`First SpellCheck Suggestion Score: ${firstSuggestion.score}`);
            console.log(`First SpellCheck Suggestion : ${firstSuggestion.suggestion}`);
          }
        }
        else {
          console.log("Couldn't get any Spell check results!");
        }
      }
      else {
        console.log("Didn't see any SpellCheck results..");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("2. This will trigger an error response from the API");

      try {
        let result = await spellCheckApiClient.spellChecker({mode: "proof"});
        console.log("Correction for Query# \"empty text field\"");
      }
      catch (err) {
        console.log(`Successfully threw error with following message: ${err.message}`);
        console.log(`Error Status Code: ${err.statusCode}`);
      }
    },
    function () {
      return new Promise((resolve) => {
        console.log(os.EOL);
        console.log("Finished running Spell-Check sample.");
        resolve();
      })
    }
  ], (err) => {
    throw (err);
  });
}

exports.sample = sample;
