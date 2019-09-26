/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const os = require("os");
const async = require('async');
const fs = require('fs');
const Search = require('azure-cognitiveservices-visualsearch');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

// Add your Bing Search V7 subscription key to your environment variables.
let keyVar = process.env['BING_SEARCH_V7_SUBSCRIPTION_KEY']

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let visualSearchApiClient = new Search.VisualSearchAPIClient(credentials);
let visualModels = visualSearchApiClient.models;

function sample() {
  async.series([
    async function () {
      let fileStream = fs.createReadStream('Data/image.jpg');
      let visualSearchRequest = JSON.stringify({});
      let visualSearchResults;
      try {
        visualSearchResults = await visualSearchApiClient.images.visualSearch({
          image: fileStream,
          knowledgeRequest: visualSearchRequest
        });
        console.log("Search visual search request with binary of dog image");
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }
      if (!visualSearchResults) {
        console.log("No visual search result data. ");
      } else {
        // Visual Search results
        if (visualSearchResults.image.imageInsightsToken) {
          console.log(`Uploaded image insights token: ${visualSearchResults.image.imageInsightsToken}`);
        }
        else {
          console.log("Couldn't find image insights token!");
        }

        // List of tags
        if (visualSearchResults.tags.length > 0) {
          let firstTagResult = visualSearchResults.tags[0];
          console.log(`Visual search tag count: ${visualSearchResults.tags.length}`);

          // List of actions in first tag
          if (firstTagResult.actions.length > 0) {
            let firstActionResult = firstTagResult.actions[0];
            console.log(`First tag action count: ${firstTagResult.actions.length}`);
            console.log(`First tag action type: ${firstActionResult.actionType}`);
          }
          else {
            console.log("Couldn't find tag actions!");
          }

        }
        else {
          console.log("Couldn't find image tags!");
        }
      }
    },
    async function () {
      let fileStream = fs.createReadStream('Data/image.jpg');
      let cropArea = { top: 0.1, bottom: 0.5, left: 0.1, right: 0.9 };
      let imageInfo = { cropArea: cropArea };
      let visualSearchRequest = JSON.stringify({ imageInfo: imageInfo });
      let visualSearchResults;
      try {
        visualSearchResults = await visualSearchApiClient.images.visualSearch({
          image: fileStream,
          knowledgeRequest: visualSearchRequest
        });
        console.log("Search visual search request with binary of dog image");
        if (!visualSearchResults) {
          console.log("No visual search result data.");
        }
        else {
          // Visual Search results
          if (visualSearchResults.image.imageInsightsToken) {
            console.log(`Uploaded image insights token: ${visualSearchResults.image.imageInsightsToken}`);
          }
          else {
            console.log("Couldn't find image insights token!");
          }

          // List of tags
          if (visualSearchResults.tags.length > 0) {
            var firstTagResult = visualSearchResults.tags[0];
            console.log(`Visual search tag count: ${visualSearchResults.tags.length}`);

            // List of actions in first tag
            if (firstTagResult.actions.length > 0) {
              var firstActionResult = firstTagResult.actions[0];
              console.log(`First tag action count: ${firstTagResult.actions.length}`);
              console.log(`First tag action type: ${firstActionResult.actionType}`);
            }
            else {
              console.log("Couldn't find tag actions!");
            }

          }
          else {
            console.log("Couldn't find image tags!");
          }
        }
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }
    },
    async function () {
      let imageInfo = { url: "https://images.unsplash.com/photo-1512546148165-e50d714a565a?w=600&q=80" };
      let filters = { site: "www.bing.com" };
      let knowledgeRequest = { filters: filters };
      let visualSearchRequest = JSON.stringify({ imageInfo: imageInfo, knowledgeRequest: knowledgeRequest });
      let visualSearchResults;
      try {
        visualSearchResults = await visualSearchApiClient.images.visualSearch({
          knowledgeRequest: visualSearchRequest
        });
        console.log("Search visual search request with binary of dog image");
        if (!visualSearchResults) {
          console.log("No visual search result data.");
        }
        else {
          // Visual Search results
          if (visualSearchResults.image.imageInsightsToken) {
            console.log(`Uploaded image insights token: ${visualSearchResults.image.imageInsightsToken}`);
          }
          else {
            console.log("Couldn't find image insights token!");
          }

          // List of tags
          if (visualSearchResults.tags.length > 0) {
            var firstTagResult = visualSearchResults.tags[0];
            console.log(`Visual search tag count: ${visualSearchResults.tags.length}`);

            // List of actions in first tag
            if (firstTagResult.actions.length > 0) {
              var firstActionResult = firstTagResult.actions[0];
              console.log(`First tag action count: ${firstTagResult.actions.length}`);
              console.log(`First tag action type: ${firstActionResult.actionType}`);
            }
            else {
              console.log("Couldn't find tag actions!");
            }

          }
          else {
            console.log("Couldn't find image tags!");
          }
        }
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }
    },
    async function () {
      var imageInsightsToken = "bcid_113F29C079F18F385732D8046EC80145*ccid_oV/QcH95*mid_687689FAFA449B35BC11A1AE6CEAB6F9A9B53708*thid_R.113F29C079F18F385732D8046EC80145";
      let cropArea = { top: 0.1, bottom: 0.5, left: 0.1, right: 0.9 };
      let imageInfo = { imageInsightsToken: imageInsightsToken, cropArea: cropArea };
      let visualSearchRequest = JSON.stringify({ imageInfo: imageInfo });
      let visualSearchResults;
      try {
        visualSearchResults = await visualSearchApiClient.images.visualSearch({
          knowledgeRequest: visualSearchRequest
        });
        console.log("Search visual search request with binary of dog image");
        if (!visualSearchResults) {
          console.log("No visual search result data.");
        }
        else {
          // Visual Search results
          if (visualSearchResults.image.imageInsightsToken) {
            console.log(`Uploaded image insights token: ${visualSearchResults.image.imageInsightsToken}`);
          }
          else {
            console.log("Couldn't find image insights token!");
          }

          // List of tags
          if (visualSearchResults.tags.length > 0) {
            var firstTagResult = visualSearchResults.tags[0];
            console.log(`Visual search tag count: ${visualSearchResults.tags.length}`);

            // List of actions in first tag
            if (firstTagResult.actions.length > 0) {
              var firstActionResult = firstTagResult.actions[0];
              console.log(`First tag action count: ${firstTagResult.actions.length}`);
              console.log(`First tag action type: ${firstActionResult.actionType}`);
            }
            else {
              console.log("Couldn't find tag actions!");
            }

          }
          else {
            console.log("Couldn't find image tags!");
          }
        }
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }
    },
    function () {
      return new Promise((resolve) => {
        console.log(os.EOL);
        console.log("Finished running Visual-Search sample.");
        resolve();
      })
    }
  ], (err) => {
    throw (err);
  });
}

exports.sample = sample;
