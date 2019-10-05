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

// Add your Bing Search V7 subscription key to your environment variables.
let subscriptionKey = process.env['BING_SEARCH_V7_SUBSCRIPTION_KEY']
// Add your Bing Entity Search subscription key to your environment variables.
if (subscriptionKey == null || subscriptionKey == "" || subscriptionKey == undefined) {
  throw new Error('Set/export your subscription key as an environment variable.');
}

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(subscriptionKey);
let newsSearchApiClient = new Search.NewsSearchAPIClient(credentials);

function sample() {
  async.series([
    async function () {
      console.log("1. This will search news for (Quantum  Computing) with market and count parameters then verify number of results and print out totalEstimatedMatches, name, url, description, published time and name of provider of the first news result");

      let newsResults = await newsSearchApiClient.newsOperations.search("Quantum  Computing", {
        market: "en-us",
        count: 10
      });
      console.log("Search news for query \"Quantum  Computing\" with market and count");

      if (!newsResults) {
        console.log("Didn't see any news result data..");
      } else if (newsResults.value.length > 0) {
        let firstNewsResult = newsResults.value[0];

        console.log(`TotalEstimatedMatches value: ${newsResults.totalEstimatedMatches}`);
        console.log(`News result count: ${newsResults.value.length}`);
        console.log(`First news name: ${firstNewsResult.name}`);
        console.log(`First news url: ${firstNewsResult.url}`);
        console.log(`First news description: ${firstNewsResult.description}`);
        console.log(`First news published time: ${firstNewsResult.datePublished}`);
        console.log(`First news provider: ${firstNewsResult.provider[0].name}`);
      } else {
        console.log("Couldn't find news results!");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("2. This will search most recent news for (Artificial Intelligence) with freshness and sortBy parameters then verify number of results and print out totalEstimatedMatches, name, url, description, published time and name of provider of the first news result");

      let newsResults = await newsSearchApiClient.newsOperations.search("Artificial Intelligence", {
        market: "en-us",
        freshness: "Week",
        sortBy: "Date"
      });
      console.log("Search most recent news for query \"Artificial Intelligence\" with freshness and sortBy");

      if (!newsResults) {
        console.log("Didn't see any news result data..");
      } else if (newsResults.value.length > 0) {
        let firstNewsResult = newsResults.value[0];

        console.log(`TotalEstimatedMatches value: ${newsResults.totalEstimatedMatches}`);
        console.log(`News result count: ${newsResults.value.length}`);
        console.log(`First news name: ${firstNewsResult.name}`);
        console.log(`First news url: ${firstNewsResult.url}`);
        console.log(`First news description: ${firstNewsResult.description}`);
        console.log(`First news published time: ${firstNewsResult.datePublished}`);
        console.log(`First news provider: ${firstNewsResult.provider[0].name}`);
      } else {
        console.log("Couldn't find news results!");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("3. This will search category news for movie and TV entertainment with safe search then verify number of results and print out category, name, url, description, published time and name of provider of the first news result");

      let newsResults = await newsSearchApiClient.newsOperations.category({
        category: "Entertainment_MovieAndTV",
        market: "en-us",
        safeSearch: "strict"
      });
      console.log("Search category news for movie and TV entertainment with safe search");

      if (!newsResults) {
        console.log("Didn't see any news result data..");
      } else if (newsResults.value.length > 0) {
        let firstNewsResult = newsResults.value[0];

        console.log(`News result count: ${newsResults.value.length}`);
        console.log(`First news category: ${firstNewsResult.category}`);
        console.log(`First news name: ${firstNewsResult.name}`);
        console.log(`First news url: ${firstNewsResult.url}`);
        console.log(`First news description: ${firstNewsResult.description}`);
        console.log(`First news published time: ${firstNewsResult.datePublished}`);
        console.log(`First news provider: ${firstNewsResult.provider[0].name}`);
      } else {
        console.log("Couldn't find news results!");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("4. This will search news trending topics in Bing then verify number of results and print out name, text of query, webSearchUrl, newsSearchUrl and image Url of the first news result");

      let trendingTopics = await newsSearchApiClient.newsOperations.trending({market: "en-us"});
      console.log("Search news trending topics in Bing");

      if (!trendingTopics) {
        console.log("Didn't see any news trending topics..");
      }
      else if (trendingTopics.value.length > 0) {
        let firstTopic = trendingTopics.value[0];

        console.log(`Trending topics count: ${trendingTopics.value.length}`);
        console.log(`First topic name: ${firstTopic.name}`);
        console.log(`First topic query: ${firstTopic.query.text}`);
        console.log(`First topic image url: ${firstTopic.image.url}`);
        console.log(`First topic webSearchUrl: ${firstTopic.webSearchUrl}`);
        console.log(`First topic newsSearchUrl: ${firstTopic.newsSearchUrl}`);
      }
      else {
        console.log("Couldn't find news trending topics!");
      }
    },
    function () {
      return new Promise((resolve) => {
        console.log(os.EOL);
        console.log("Finished running News-Search sample.");
        resolve();
      })
    }
  ], (err) => {
    throw (err);
  });
}
sample()
exports.sample = sample;
