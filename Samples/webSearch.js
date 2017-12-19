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

let keyVar = 'AZURE_WEB_SEARCH_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];


///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let webSearchApiClient = new Search.WebSearchAPIClient(credentials);
let webModels = webSearchApiClient.models;

function sample(){
  async.series([
    async function () {
      console.log("1. This will look up a single query (Xbox) and print out name and url for first web, image, news and videos results.");
      let result;
      try {
        result = await webSearchApiClient.web.search("Xbox");
      } catch (err) {
        if (err instanceof webModels.ErrorResponse) {
          console.log("Encountered exception. " + err.message);
        }
      }
      console.log("Searched for Query: \" Xbox \"");

      // WebPages
      if (result.webPages.value.length > 0) {
        // find the first web page
        let firstWebPagesResult = result.webPages.value[0];
        if (firstWebPagesResult) {
            console.log("Webpage Results: " + result.webPages.value.length);
            console.log("First web page name: " + firstWebPagesResult.name);
            console.log("First web page URL: " + firstWebPagesResult.url);
        }
        else {
          console.log("Couldn't find web results!");
        }
      }
      else {
        console.log("Didn't see any Web data..");
      }

      // Images
      if (result.images.value.length > 0) {
        // find the first image result
        let firstImageResult = result.images.value[0];
        if (firstImageResult) {
            console.log("Image Results: " + result.images.value.length);
            console.log("First Image result name: " + firstImageResult.name);
            console.log("First Image result URL: " + firstImageResult.contentUrl);
        }
        else {
          console.log("Couldn't find image results!");
        }
      }
      else {
        console.log("Didn't see any Image data..");
      }

      // News
      if (result.news.value.length > 0) {
        // find the first news result
        let firstNewsResult = result.news.value[0];
        if (firstNewsResult) {
            console.log("News Results: " + result.news.value.length);
            console.log("First news result name: " + firstNewsResult.name);
            console.log("First news result URL: " + firstNewsResult.url);
        }
        else {
          console.log("Couldn't find news results!");
        }
      }
      else {
        console.log("Didn't see any News data..");
      }
      
      // Videos
      if (result.videos.value.length > 0) {
        // find the first video result
        let firstVideoResult = result.videos.value[0];
        if (firstVideoResult) {
            console.log("Video Results: " + result.videos.value.length);
            console.log("First video result name: " + firstVideoResult.name);
            console.log("First video result URL: " + firstVideoResult.contentUrl);
        }
        else {
          console.log("Couldn't find video results!");
        }
      }
      else {
        console.log("Didn't see any video data..");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("2. This will search (Best restaurants in Seattle), verify number of results and print out name and url of first result.");
      let result;
      try {
        result = await webSearchApiClient.web.search("Best restaurants in Seattle", {
          offset: 10,
          count: 20
        });
      } catch (err) {
        if (err instanceof webModels.ErrorResponse) {
          console.log("Encountered exception. " + err.message);
        }
      }
      console.log("Searched for Query# \" Best restaurants in Seattle \"");

      if (result.webPages.value.length > 0){
        // find the first web page
        let firstWebPagesResult = result.webPages.value[0];
        if (firstWebPagesResult){
          console.log("Web Results: " + result.webPages.value.length);
          console.log("First web page name: " + firstWebPagesResult.name);
          console.log("First web page URL: " + firstWebPagesResult.url);
        }
        else {
          console.log("Couldn't find any web result!");
        }
      }
      else {
        console.log("Didn't see any Web data..");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("3. This will search (Microsoft) with response filters to news and print details of news.");
      let result;
      try {
        result = await webSearchApiClient.web.search("Microsoft", {
          responseFilter: ["news"]
        });
      } catch (err) {
        if (err instanceof webModels.ErrorResponse) {
          console.log("Encountered exception. " + err.message);
        }
      }
      console.log("Searched for Query# \" Microsoft \" with response filters \"news\"");

      if (result.news.value.length > 0){
        // find the first web page
        let firstNewsResult = result.news.value[0];
        if (firstNewsResult){
          console.log("News Results: " + result.news.value.length);
          console.log("First news page name: " + firstNewsResult.name);
          console.log("First news page URL: " + firstNewsResult.url);
        }
        else {
          console.log("Couldn't find any news result!");
        }
      }
      else {
        console.log("Didn't see any news data..");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("4. This will search (Lady Gaga) with answerCount and promote parameters and print details of answers.");
      let result;
      try {
        result = await webSearchApiClient.web.search("Lady Gaga", {
          answerCount: 2,
          promote: ["videos"],
          safeSearch: "Strict"
        });
      } catch (err) {
        if (err instanceof webModels.ErrorResponse) {
          console.log("Encountered exception. " + err.message);
        }
      }
      console.log("Searched for Query# \" Lady Gaga \"");

      if (result.videos.value.length > 0){
        // find the first web page
        let firstVideoResult = result.videos.value[0];
        if (firstVideoResult){
          console.log("Video Results: " + result.videos.value.length);
          console.log("First Video page name: " + firstVideoResult.name);
          console.log("First Video page URL: " + firstVideoResult.contentUrl);
        }
        else {
          console.log("Couldn't find any video result!");
        }
      }
      else {
        console.log("Didn't see any data..");
      }
    },

    function () {
      return new Promise((resolve) => {
        console.log(os.EOL);
        console.log("Finished running Web-Search sample.");
        resolve();
      })
    }
  ], (err) => {
    throw(err);
  });
}

exports.sample = sample;