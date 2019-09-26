/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const readline = require('readline');
const os = require("os");
const async = require('async');
const Vision = require('azure-cognitiveservices-vision');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

// Add your Azure Content Moderator subscription key to your environment variables.
let keyVar = process.env['CONTENT_MODERATOR_SUBSCRIPTION_KEY']

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];

const samples = {
  ImageModeration: './contentModerator/ImageModeration',
  ImageListManagement: './contentModerator/ImageListManagement',
  ImageJobs: './contentModerator/ImageJobs',
  ImageReviews: './contentModerator/ImageReviews',
  TermListManagement: './contentModerator/TermListManagement',
  TextModeration: './contentModerator/TextModeration',
  VideoReviews: './contentModerator/VideoReviews',
  VideoTranscriptReviews: './contentModerator/VideoTranscriptReviews'
}

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);

// Add your Azure Content Moderator endpoint to your environment variables.
let contentModeratorApiClient = new Vision.ContentModeratorAPIClient(credentials, process.env['CONTENT_MODERATOR_ENDPOINT']);
const separator = "------------------------------------------------------------------------------------";

function sample(rl) {
  rl["keepOpen"] = true;
  askSample();

  function askSample() {
    console.log(`Hi! Which API would you like to sample? Pick one of the following: (CTRL+C to exit)`);
    console.log(separator);
    console.log(Object.keys(samples).join(', '));
    console.log(separator);
    rl.question('', function (answer) {
      if (samples.hasOwnProperty(answer)) {
        console.log(`Ok, running ${answer} sample`);
        const Sample = require(samples[answer]);
        let res = Sample.sample(contentModeratorApiClient);
        rl.close();
      }
      else {
        console.log(`Sorry, \"${answer}\" doesn't seem to be a valid sample.`);
        askSample();
      }
    });
  }
}

exports.sample = sample;
