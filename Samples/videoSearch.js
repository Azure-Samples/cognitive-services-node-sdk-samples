/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const util = require('util');
const os = require("os");
const async = require('async');
const Search = require('azure-cognitiveservices-search');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let keyVar = 'AZURE_VIDEO_SEARCH_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];


///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let videoSearchApiClient = new Search.VideoSearchAPIClient(credentials);

function sample(){
  async.series([
    async function () {
      console.log("1. This will search videos for (Nasa CubeSat) then verify number of results and print out id, name and url of first video result");
      let result;
      try {
        result = await videoSearchApiClient.videosOperations.search("Nasa CubeSat");
        console.log("Search videos for query \"Nasa CubeSat\"");
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }
      if (!result) {
        console.log("Didn't see any video result data..");
      } else if (result.value.length > 0) {
        let firstVideo = result.value[0];
        console.log(`Video result count: ${result.value.length}`);
        console.log(`First video id: ${firstVideo.videoId}`);
        console.log(`First video name: ${firstVideo.name}`);
        console.log(`First video url: ${firstVideo.contentUrl}`);
      } else {
        console.log("Couldn't find video results!");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("2. This will search videos for (Interstellar Trailer) that is free, short and 1080p resolution then verify number of results and print out id, name and url of first video result");
      let result;
      try {
        result = await videoSearchApiClient.videosOperations.search("Interstellar Trailer", {
          pricing: "Free",
          length: "Short",
          resolution: "HD1080p"
        });
        console.log("Search videos for query \"Interstellar Trailer\" that is free, short and 1080p resolution");
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }
      if (!result) {
        console.log("Didn't see any video result data..");
      } else if (result.value.length > 0) {
        let firstVideo = result.value[0];
        console.log(`Video result count: ${result.value.length}`);
        console.log(`First video id: ${result.value[0].videoId}`);
        console.log(`First video name: ${result.value[0].name}`);
        console.log(`First video url: ${result.value[0].contentUrl}`);
      } else {
        console.log("Couldn't find video results!");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("3. This will find trending videos then verify banner tiles and categories");
      let result;
      try {
        result = await videoSearchApiClient.videosOperations.trending();
        console.log("Search trending videos");
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }

      if (!result) {
        console.log("Didn't see any trending video data..");
      } else {
        // Banner Tiles
        if (result.bannerTiles.length > 0) {
          let firstBannerTile = result.bannerTiles[0];
          console.log(`Banner tile count: ${result.bannerTiles.length}`);
          console.log(`First banner tile text: ${firstBannerTile.query.text}`);
          console.log(`First banner tile url: ${firstBannerTile.query.webSearchUrl}`);
        } else {
          console.log("Couldn't find banner tiles");
        }

        // Categories
        if (result.categories.length > 0) {
          let firstCategory = result.categories[0];
          console.log(`Category count: ${result.categories.length}`);
          console.log(`First category title: ${firstCategory.title}`);

          if (firstCategory.subcategories.length > 0) {
            let firstSubCategory = firstCategory.subcategories[0];
            console.log(`SubCategory count: ${firstCategory.subcategories.length}`);
            console.log(`First sub category title: ${firstSubCategory.title}`);

            if (firstSubCategory.tiles.length > 0) {
              let firstTile = firstSubCategory.tiles[0];
              console.log(`Tile count: ${firstSubCategory.tiles.length}`);
              console.log(`First tile text: ${firstTile.query.text}`);
              console.log(`First tile url: ${firstTile.query.webSearchUrl}`);
            } else {
              console.log("Couldn't find tiles!");
            }
          } else {
            console.log("Couldn't fine subcategories!");
          }
        } else {
          console.log("Couldn't find categories!");
        }
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("4. This will search videos for (Interstellar Trailer) and then search for detail information of the first video");
      let result;
      let videoDetail;
      try {
        result = await videoSearchApiClient.videosOperations.search("Interstellar Trailer");
        if (!result || !result.value || result.value.length === 0) {
          console.log("Couldn't find video results!");
        } else {
          result = result.value[0];
          videoDetail = await videoSearchApiClient.videosOperations.details("Interstellar Trailer", {
            id: result.videoId,
            modules: ['All']
          });
          console.log(`Search detail for video id=${result.videoId}, name=${result.name}`);
        }
      } catch (err) {
        console.log("Encountered exception. " + err.message);
      }

      if (videoDetail) {
        if (videoDetail.videoResult) {
            console.log(`Expected video id: ${videoDetail.videoResult.videoId}`);
            console.log(`Expected video name: ${videoDetail.videoResult.name}`);
            console.log(`Expected video url: ${videoDetail.videoResult.contentUrl}`);
        }
        else
        {
            console.log("Couldn't find expected video!");
        }

        if (videoDetail.relatedVideos.value.length > 0) {
          let firstRelatedVideo = videoDetail.relatedVideos.value[0];
          console.log(`Related video count: ${videoDetail.relatedVideos.value.length}`);
          console.log(`First related video id: ${firstRelatedVideo.videoId}`);
          console.log(`First related video name: ${firstRelatedVideo.name}`);
          console.log(`First related video url: ${firstRelatedVideo.contentUrl}`);
        }
        else {
          console.log("Couldn't find any related video!");
        }
      } else {
        console.log("Couldn't find details about the video!");
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
    throw(err);
  });
}

exports.sample = sample;
