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
const latencyDelay = 45;
const callbackEndpoint = "https://requestb.in/vxke1mvx";
const imageUrl = "https://moderatorsampleimages.blob.core.windows.net/samples/sample2.jpg";
const teamName = "testreviewwilx";
const workflowName = "default";

async function sample(client) {
  console.log("1. Create moderation job for an image.");

  try {
    let jobResult = await client.reviews.createJobWithHttpOperationResponse(teamName, "image", "contentID", workflowName,
      "application/json", { contentValue: imageUrl }, callbackEndpoint);

    // Record the job ID.
    let jobId = jobResult.body.jobId;

    // Log just the response body from the returned task.
    console.log(JSON.stringify(jobResult.body, null, 2));

    await setTimeoutPromise(throttleRate, null);
    console.log(os.EOL);

    console.log("Get job status before review.");
    let jobDetails = await client.reviews.getJobDetailsWithHttpOperationResponse(teamName, jobId);

    // Log just the response body from the returned task.
    console.log(JSON.stringify(jobDetails.body, null, 2));

    console.log(os.EOL);
    console.log("Perform manual reviews on the Content Moderator site.");

    console.log(os.EOL);
    console.log(`Waiting ${latencyDelay} seconds for results to propagate.`);
    await setTimeoutPromise(latencyDelay * 1000, null);

    console.log("Get job status after review.");
    jobDetails = await client.reviews.getJobDetailsWithHttpOperationResponse(teamName, jobId);

    // Log just the response body from the returned task.
    console.log(JSON.stringify(jobDetails.body, null, 2));
  } catch (err) {
    console.log(err);
  }
}

exports.sample = sample;