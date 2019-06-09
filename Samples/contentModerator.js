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

let keyVar = 'AZURE_CONTENT_MODERATOR_KEY';

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
  VideoAnalyze: './contentModerator/VideoAnalyze',
  VideoReviews: './contentModerator/VideoReviews',
  VideoTranscriptReviews: './contentModerator/VideoTranscriptReviews'
}

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let contentModeratorApiClient = new Vision.ContentModeratorAPIClient(credentials, 'westus.api.cognitive.microsoft.com');
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