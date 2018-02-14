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
const utf8 = require('utf8');
const Readable = require('stream').Readable;
const setTimeoutPromise = util.promisify(setTimeout);

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

const throttleRate = 2000;
const teamName = "testwilxx";

const streamingcontent = "https://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest";
const transcript = `WEBVTT

01:01.000 --> 02:02.000
First line with a crap word in a transcript.

02:03.000 --> 02:25.000
This is another line in the transcript.
`;

async function sample(client) {
  try {
    console.log("1. Creating review.");
    let review_id = await createReview(client, "review1", streamingcontent);
    console.log("\n2. Adding transcript.");
    await addTranscript(client, review_id, transcript);
    console.log("\n3. Adding transcript moderation result.");
    await addTranscriptModerationResult(client, review_id, transcript);
    console.log("\n4. Publishing review.");
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

async function addTranscript(client, review_id, transcript) {
  console.log(`Adding a transcript to the review with ID ${review_id}`);
  let transcriptStream = Readable();
  transcriptStream.push(transcript);
  transcriptStream.push(null);
  await client.reviews.addVideoTranscript(teamName, review_id, transcriptStream);
  await setTimeoutPromise(throttleRate, null);
}

async function addTranscriptModerationResult(client, review_id, transcript) {
  console.log(`Adding a transcript moderation result to the review with ID ${review_id}`);
  // Screen the transcript using the Text Moderation API. For more information, see:
  // https://westus2.dev.cognitive.microsoft.com/docs/services/57cf753a3f9b070c105bd2c1/operations/57cf753a3f9b070868a1f66f
  let screen = await client.textModeration.screenText("eng", "text/plain", transcript);

  // Map the term list returned by ScreenText into a term list we can pass to AddVideoTranscriptModerationResult.
  let terms = [];
  if (screen.terms) {
    for (let i = 0; i < screen.terms.length; i++) {
      let term = screen.terms[i];
      console.log(term);
    }
  }

  let body = [
    {
      timestamp: "0",
      terms: terms
    }
  ];

  await client.reviews.addVideoTranscriptModerationResult("application/json", teamName, review_id, body);
  await setTimeoutPromise(throttleRate, null);
}

async function publishReview(client, review_id) {
  console.log(`Publishing the review with ID ${review_id}.`);
  await client.reviews.publishVideoReview(teamName, review_id);
  await setTimeoutPromise(throttleRate, null);
}

exports.sample = sample;