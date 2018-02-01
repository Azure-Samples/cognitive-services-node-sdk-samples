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
const Vision = require('azure-cognitiveservices-vision');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let keyVar = 'AZURE_COMPUTER_VISION_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];


///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let computerVisionApiClient = new Vision.ComputerVisionAPIClient(credentials, "westus");
let cvModels = computerVisionApiClient.models;

function sample() {
  async.series([
    async function () {
      console.log("1. This will analyze a house image and describe it.");
      let fileStream = fs.createReadStream('Images/house.jpg');

      let result = await computerVisionApiClient.analyzeImageInStream(fileStream, {
        visualFeatures: ["Categories", "Tags", "Description", "Color", "Faces", "ImageType"]
      });

      // Description Results
      if (((result.description || {}).captions || {}).length > 0){
        console.log(`The image can be described as: ${result.description.captions[0].text}`);
        console.log(`Confidence of description: ${result.description.captions[0].confidence}`);
      } else {
        console.log("Didn't see any image descriptions..");
      }

      // Tag Results
      console.log(os.EOL);
      if (result.tags.length > 0){
        console.log("Tags associated with this image:\nTag\t\tConfidence");
        for (let i=0; i < result.tags.length; i++){
          console.log(`${result.tags[i].name}\t\t${result.tags[i].confidence}`);
        }
      } else {
        console.log("Didn't see any image tags..");
      }

      // Color Results
      console.log(os.EOL);
      console.log(`The primary colors of this image are: ${result.color.dominantColors.join(', ')}.`);
    },
    function () {
      return new Promise((resolve) => {
        console.log(os.EOL);
        console.log("Finished running Computer-Vision sample.");
        resolve();
      })
    }
  ], (err) => {
    throw (err);
  });
}

exports.sample = sample;