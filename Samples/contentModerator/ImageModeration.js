/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const util = require('util');
const os = require("os");
const async = require('async');
const setTimeoutPromise = util.promisify(setTimeout);

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

const imageUrls = [
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample2.jpg",
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample5.png"
];

function sample(client) {
  console.log("1. This will analyze multiple images for various content.");
  console.log(os.EOL);

  let bodyModel;
  let result;
  let functions = [detectRacy, detectText, detectFace];

  analyzeImage(0, 0);

  function analyzeImage(imgIndex, funcIndex) {
    if (funcIndex == 0) {
      bodyModel = {
        dataRepresentation: 'URL',
        value: imageUrls[imgIndex]
      }
      console.log(`Analyzing: ${bodyModel.value}`);
    }
    functions[funcIndex]().then((result) => {
      console.log("waiting 1 second before next request..");
      return setTimeoutPromise(1000, result);
    }).then(() => {
      let newImgIndex = imgIndex;
      let newFuncIndex = funcIndex + 1;
      if (newFuncIndex >= functions.length) {
        newFuncIndex = 0;
        newImgIndex++;
      }
      if (newImgIndex < imageUrls.length) {
        analyzeImage(newImgIndex, newFuncIndex);
      }
    }).catch((err) => {
      throw (err);
    });
  }

  async function detectRacy() {
    console.log("Evaluating for adult and racy content.");
    try {
      let result = await client.imageModeration.evaluateUrlInput("application/json", bodyModel);
      console.log(JSON.stringify(result, null, 2));
      console.log(os.EOL);
      return result;
    } catch (err) {
      throw (err);
    }
  }

  async function detectText() {
    console.log("Detect and extract text.");
    try {
      let result = await client.imageModeration.oCRUrlInput('eng', 'application/json', bodyModel);
      console.log(JSON.stringify(result, null, 2));
      console.log(os.EOL);
      return result;
    } catch (err) {
      throw (err);
    }
  }

  async function detectFace() {
    console.log("Detect faces.");
    try {
      let result = await client.imageModeration.findFacesUrlInput('application/json', bodyModel);
      console.log(JSON.stringify(result, null, 2));
      console.log(os.EOL);
      return result;
    } catch (err) {
      throw (err);
    }
  }
}

exports.sample = sample;