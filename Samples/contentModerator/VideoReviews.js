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

const throttleRate = 2000;
const teamName = "testwilxx";

const streamingcontent = "https://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest";
const frame1_url = "https://blobthebuilder.blob.core.windows.net/sampleframes/ams-video-frame1-00-17.PNG";
const frame2_url = "https://blobthebuilder.blob.core.windows.net/sampleframes/ams-video-frame-2-01-04.PNG";
const frame3_url = "https://blobthebuilder.blob.core.windows.net/sampleframes/ams-video-frame-3-02-24.PNG";


async function sample(client) {
  try {
    console.log("1. Create a review with the content pointing to a streaming endpoint (manifest).");
    let review_id = await createReview(client, "review1", streamingcontent);

    console.log("\n2. Adding frames with different timestamps.");
    // Add the frames from 17, 64, and 144 seconds.
    await addFrame(client, review_id, frame1_url, 17);
    await addFrame(client, review_id, frame2_url, 64);
    await addFrame(client, review_id, frame3_url, 144);

    console.log("\n3. Get frame and review information.");
    // Get frames information and show
    await getFrames(client, review_id);
    await getReview(client, review_id);

    console.log("\n4. Publish the review.");
    // Publish the review
    await publishReview(client, review_id);

    console.log("\nOpen your Content Moderator Dashboard and select Review > Video to see the review.");
  } catch (err) {
    console.log(err);
  }
}

async function createReview(client, id, content) {
  console.log("Creating a video review.");
  let body = [
    {
      content: content,
      contentId: id,
      // Note: to create a published review, set the Status to "Pending".
      // However, you cannot add video frames or a transcript to a published review.
      status: "Unpublished"
    }
  ];
  let result = await client.reviews.createVideoReviews("application/json", teamName, body);
  await setTimeoutPromise(throttleRate, null);

  // We created only one review.
  return result[0];
}

function createFrameToAddToReview(url, timestamp_seconds) {
  // We generate random "adult" and "racy" scores for the video frame.
  let rand = Math.random();
  let frame = {
    timestamp: String(timestamp_seconds * 1000),
    frameImage: url,
    metadata: [
      {
        key: "reviewRecommended",
        value: "true"
      },
      {
        key: "adultScore",
        value: String(Math.random())
      },
      {
        key: "a",
        value: "false"
      },
      {
        key: "racyScore",
        value: String(Math.random())
      },
      {
        key: "r",
        value: "false"
      }
    ],
    reviewerResultTags: [
      {
        key: "tag1",
        value: "value1"
      }
    ]
  };

  return frame;
}

async function addFrame(client, review_id, url, timestamp_seconds) {
  console.log(`Adding a frame to the review with ID ${review_id}`);
  let frames = [
    createFrameToAddToReview(url, timestamp_seconds)
  ];

  await client.reviews.addVideoFrameUrl("application/json", teamName, review_id, frames);
  await setTimeoutPromise(throttleRate, null);
}

async function getFrames(client, review_id){
  console.log(`Getting frames for the review with ID ${review_id}`);
  let result = await client.reviews.getVideoFrames(teamName, review_id, {
    startSeed: 0,
    noOfRecords: Number.MAX_SAFE_INTEGER
  });
  console.log(JSON.stringify(result, null, 2));
  await setTimeoutPromise(throttleRate, null);
}

async function getReview(client, review_id){
  console.log(`Getting the status for the review with ID ${review_id}`);
  let result = await client.reviews.getReview(teamName, review_id);
  console.log(JSON.stringify(result, null, 2));
  await setTimeoutPromise(throttleRate, null);
}

async function publishReview(client, review_id){
  console.log(`Publishing the review with ID ${review_id}.`);
  await client.reviews.publishVideoReview(teamName, review_id);
  await setTimeoutPromise(throttleRate, null);
}

exports.sample = sample;