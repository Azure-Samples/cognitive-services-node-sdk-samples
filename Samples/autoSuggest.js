/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const os = require("os");
const async = require('async');
const fs = require('fs');
const Search = require('azure-cognitiveservices-autosuggest');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

const keyVar = 'AZURE_AUTOSUGGEST_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

const serviceKey = process.env[keyVar];

const query = "Satya Nadella";

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

const credentials = new CognitiveServicesCredentials(serviceKey);
const autoSuggestApiClient = new Search.AutoSuggestAPIClient(credentials);
const autoSuggestModels = autoSuggestApiClient.models;

function sample() {
  async.series([
    async function () {
      let autoSuggestResults;
      try {
        autoSuggestResults = await autoSuggestApiClient.autoSuggest(query);
        console.log("Request autosuggestions for '" + query + "'");
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }
      if (!autoSuggestResults) {
        console.log("No autosuggest result data. ");
      } else {
        // AutoSuggest results
        const suggestionGroups = autoSuggestResults.suggestionGroups;
        if (!suggestionGroups || suggestionGroups.length === 0) {
          console.log("No suggestion groups returned.");
        } else {
          console.log(`Found Suggestion Groups:`);
          let suggestionGroupNumber = 0;
          for (const suggestionGroup of suggestionGroups) {
            console.log(`${++suggestionGroupNumber}: ${suggestionGroup.name}`);
            const searchSuggestions = suggestionGroup.searchSuggestions;
            if (!searchSuggestions || searchSuggestions.length === 0) {
              console.log(`  No suggestions.`);
            } else {
              let searchSuggestionNumber = 0;
              for (const searchSuggestion of searchSuggestions) {
                console.log(`  ${suggestionGroupNumber}.${++searchSuggestionNumber}: ${suggestion.displayText}`);
              }
            }
          }
        }
      }
    },
    async function () {
      try {
        await autoSuggestApiClient.autoSuggest(query, {
          market: "no-ty"
        });
      } catch (err) {
        console.log("Exception occurred, status code " + err.response.status.code + " with reason " + err + ".\n");

        if (err.error.errors && err.error.errors.length > 0) {
          console.log("This is the errors I have:")
          for (const error of err.error.errors) {
            console.log("Parameter \"" + error.parameter + "\" has an invalid value \"" + error.value + "\". SubCode is \"" + error.sub_code + "\". Detailed message is \"" + error.message + "\"");
          }
        } else {
          console.log("There was no details on the error.")
        }
      }
    }
  ], (err) => {
    throw (err);
  });
}

exports.sample = sample;