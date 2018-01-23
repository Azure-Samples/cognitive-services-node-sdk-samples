/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const util = require('util');
const os = require("os");
const async = require('async');
const fs = require('fs');
const setTimeoutPromise = util.promisify(setTimeout);

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

const imageUrls = [
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample5.png"
];

const teamName = "testreviewwilx";
const callbackEndpoint = "https://requestb.in/vxke1mvx";
const mediaType = "image";
const throttleRate = 2000;
const latencyDelay = 45;
let reviewItems = [];

async function sample(client) {
  console.log("1. This will create review information for the image.");
  await createReviews(client);

  console.log(os.EOL);
  console.log("2. This will get review information using the reviewId from the last call.");
  await getReviewDetails(client);
  console.log("Perform manual reviews on the Content Moderator site.");
  console.log(`Waiting ${latencyDelay} seconds for results to propigate.`);
  await setTimeoutPromise(latencyDelay * 1000, null);

  console.log(os.EOL);
  console.log("3. Get review information again after wait.");
  await getReviewDetails(client);
}

// Create the reviews using the fixed list of images.
async function createReviews(client) {
  console.log("Creating reviews for the following images:");

  // Create the structure to hold the request body information.
  let requestInfo = [];
  // Create standard metadata to add to each item.
  let metadata = [{
    key: "sc",
    value: "true"
  }];

  // Populate the request body information and the initial cached review information.
  for (let i = 0; i < imageUrls.length; i++) {
    // Cache the local information with which to create the review.
    let itemInfo = {
      type: "image",
      url: imageUrls[i],
      contentId: i.toString()
    };
    console.log(` - ${itemInfo.url}; with id = ${itemInfo.contentId}`);

    // Add the item information to the request information.
    requestInfo.push({
      type: itemInfo.type,
      content: itemInfo.url,
      contentId: itemInfo.contentId,
      callbackEndpoint: callbackEndpoint,
      metadata: metadata
    });

    // Cache the review creation information.
    reviewItems.push(itemInfo);
  }

  try {
    let result = await client.reviews.createReviewsWithHttpOperationResponse('application/json', teamName, requestInfo);

    // Update the local cache to associate the created review IDs with
    // the associated content.
    let reviewIds = result.body;
    for (let i = 0; i < reviewIds.length; i++) {
      reviewItems[i].reviewId = reviewIds[i];
    }
    console.log(JSON.stringify(reviewIds, null, 2));
    console.log(`waiting ${throttleRate/1000} seconds..`);
    await setTimeoutPromise(throttleRate, null);
    return reviewIds;
  } catch (err) {
    throw (err);
  }
}

async function getReviewDetails(client) {
  console.log("Getting review details:");

  try{
    return await getReviewHelper(0);
  } catch (err) {
    throw (err);
  }
  async function getReviewHelper(i) {
    if (i < reviewItems.length) {
      let item = reviewItems[i];
      let reviewDetail = await client.reviews.getReviewWithHttpOperationResponse(teamName, item.reviewId);
      console.log(`Review ${item.reviewId} for item ID ${item.contentId} is ${reviewDetail.body.status}`);
      console.log(JSON.stringify(reviewDetail.body, null, 2));
      console.log(`waiting ${throttleRate/1000} seconds..`);
      await setTimeoutPromise(throttleRate, null);
      return await getReviewHelper(i+1);
    } else {
      return null;
    }
  }
}

exports.sample = sample;