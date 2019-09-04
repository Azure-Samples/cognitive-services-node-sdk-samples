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

let keyVar = process.env['BING_SEARCH_V7_SUBSCRIPTION_KEY']

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];


///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let imageSearchApiClient = new Search.ImageSearchAPIClient(credentials);

function sample() {
  async.series([
    async function () {
      console.log("1. This will search images for (canadian rockies) then verify number of results and print out first image result, pivot suggestion, and query expansion");

      let imageResults = await imageSearchApiClient.imagesOperations.search("canadian rockies");
      console.log("Search images for query \"canadian rockies\"");

      if (imageResults == null) {
        console.log("No image result data.");
      }
      else {
        // Image results
        if (imageResults.value.length > 0) {
          let firstImageResult = imageResults.value[0];

          console.log(`Image result count: ${imageResults.value.length}`);
          console.log(`First image insights token: ${firstImageResult.imageInsightsToken}`);
          console.log(`First image thumbnail url: ${firstImageResult.thumbnailUrl}`);
          console.log(`First image content url: ${firstImageResult.contentUrl}`);
        }
        else {
          console.log("Couldn't find image results!");
        }

        console.log(`Image result total estimated matches: ${imageResults.totalEstimatedMatches}`);
        console.log(`Image result next offset: ${imageResults.nextOffset}`);

        // Pivot suggestions
        if (imageResults.pivotSuggestions.length > 0) {
          let firstPivot = imageResults.pivotSuggestions[0];

          console.log(`Pivot suggestion count: ${imageResults.pivotSuggestions.length}`);
          console.log(`First pivot: ${firstPivot.pivot}`);

          if (firstPivot.suggestions.length > 0) {
            let firstSuggestion = firstPivot.suggestions[0];

            console.log(`Suggestion count: ${firstPivot.suggestions.length}`);
            console.log(`First suggestion text: ${firstSuggestion.text}`);
            console.log(`First suggestion web search url: ${firstSuggestion.webSearchUrl}`);
          }
          else {
            console.log("Couldn't find suggestions!");
          }
        }
        else {
          console.log("Couldn't find pivot suggestions!");
        }

        // Query expansions
        if (imageResults.queryExpansions.length > 0) {
          let firstQueryExpansion = imageResults.queryExpansions[0];

          console.log(`Query expansion count: ${imageResults.queryExpansions.length}`);
          console.log(`First query expansion text: ${firstQueryExpansion.text}`);
          console.log(`First query expansion search link: ${firstQueryExpansion.searchLink}`);
        }
        else {
          console.log("Couldn't find query expansions!");
        }
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("2. This will search images for (studio ghibli), filtered for animated gifs and wide aspect, then verify number of results and print out insightsToken, thumbnail url and web url of first result");

      let imageResults = await imageSearchApiClient.imagesOperations.search("studio ghibli", {
        imageType: "AnimatedGif",
        aspect: "Wide"
      });
      console.log("Search images for \"studio ghibli\" results that are animated gifs and wide aspect");

      if (imageResults == null) {
        console.log("Didn't see any image result data.");
      }
      else {
        // First image result
        if (imageResults.value.length > 0) {
          let firstImageResult = imageResults.value[0];

          console.log(`Image result count: ${imageResults.value.length}`);
          console.log(`First image insightsToken: ${firstImageResult.imageInsightsToken}`);
          console.log(`First image thumbnail url: ${firstImageResult.thumbnailUrl}`);
          console.log(`First image web search url: ${firstImageResult.webSearchUrl}`);
        }
        else {
          console.log("Couldn't find image results!");
        }
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("3. This will search for trending images then verify categories and tiles");

      let trendingResults = await imageSearchApiClient.imagesOperations.trending();
      console.log("Search trending images");

      if (trendingResults == null) {
        console.log("Didn't see any trending image data.");
      }
      else {
        // Categories
        if (trendingResults.categories.length > 0)
        {
          let firstCategory = trendingResults.categories[0];
          console.log(`Category count: ${trendingResults.categories.length}`);
          console.log(`First category title: ${firstCategory.title}`);

          // Tiles
          if (firstCategory.tiles.length > 0)
          {
            let firstTile = firstCategory.tiles[0];
            console.log(`Tile count: ${firstCategory.tiles.length}`);
            console.log(`First tile text: ${firstTile.query.text}`);
            console.log(`First tile url: ${firstTile.query.webSearchUrl}`);
          }
          else {
            console.log("Couldn't find tiles!");
          }
        }
        else {
          console.log("Couldn't find categories!");
        }
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("4. This will search images for (degas) and then search for image details of the first image");

      let imageResults = await imageSearchApiClient.imagesOperations.search("degas");

      let firstImage = imageResults.value[0];
        
      if (firstImage != null) {
        let imageDetail = await imageSearchApiClient.imagesOperations.details("degas", {
          insightsToken: firstImage.imageInsightsToken,
          modules: ['All']
        });
        console.log(`Search detail for image insightsToken=${firstImage.imageInsightsToken}`);

        if (imageDetail != null) {
          // Insights token
          console.log(`Expected image insights token: ${imageDetail.imageInsightsToken}`);

          // Best representative query
          if (imageDetail.bestRepresentativeQuery != null) {
            console.log(`Best representative query text: ${imageDetail.bestRepresentativeQuery.text}`);
            console.log(`Best representative query web search url: ${imageDetail.bestRepresentativeQuery.webSearchUrl}`);
          }
          else {
            console.log("Couldn't find best representative query!");
          }

          // Caption 
          if (imageDetail.imageCaption != null) {
            console.log(`Image caption: ${imageDetail.imageCaption.caption}`);
            console.log(`Image caption data source url: ${imageDetail.imageCaption.dataSourceUrl}`);
          }
          else {
            console.log("Couldn't find image caption!");
          }

          // Pages including the image
          if (imageDetail.pagesIncluding.value.length > 0)
          {
            let firstPage = imageDetail.pagesIncluding.value[0];
            console.log(`Pages including count: ${imageDetail.pagesIncluding.value.length}`);
            console.log(`First page content url: ${firstPage.contentUrl}`);
            console.log(`First page name: ${firstPage.name}`);
            console.log(`First page date published: ${firstPage.datePublished}`);
          }
          else {
            console.log("Couldn't find any pages including this image!");
          }

          // Related searches 
          if (imageDetail.relatedSearches.value.length > 0)
          {
            let firstRelatedSearch = imageDetail.relatedSearches.value[0];
            console.log(`Related searches count: ${imageDetail.relatedSearches.value.length}`);
            console.log(`First related search text: ${firstRelatedSearch.text}`);
            console.log(`First related search web search url: ${firstRelatedSearch.webSearchUrl}`);
          }
          else {
            console.log("Couldn't find any related searches!");
          }

          // Visually similar images
          if (imageDetail.visuallySimilarImages.value.length > 0)
          {
            let firstVisuallySimilarImage = imageDetail.visuallySimilarImages.value[0];
            console.log(`Visually similar images count: ${imageDetail.relatedSearches.value.length}`);
            console.log(`First visually similar image name: ${firstVisuallySimilarImage.name}`);
            console.log(`First visually similar image content url: ${firstVisuallySimilarImage.contentUrl}`);
            console.log(`First visually similar image size: ${firstVisuallySimilarImage.contentSize}`);
          }
          else {
            console.log("Couldn't find any related searches!");
          }

          // Image tags
          if (imageDetail.imageTags.value.length > 0)
          {
            let firstTag = imageDetail.imageTags.value[0];
            console.log(`Image tags count: ${imageDetail.imageTags.value.length}`);
            console.log(`First tag name: ${firstTag.name}`);
          }
          else {
            console.log("Couldn't find any related searches!");
          }
        }
        else {
          console.log("Couldn't find detail about the image!");
        }
      }
      else {
        console.log("Couldn't find image results!");
      }
    },
    function () {
      return new Promise((resolve) => {
        console.log(os.EOL);
        console.log("Finished running Image-Search sample.");
        resolve();
      })
    }
  ], (err) => {
    throw (err);
  });
}

exports.sample = sample;
