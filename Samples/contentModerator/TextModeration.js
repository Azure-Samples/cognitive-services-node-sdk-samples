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

const textFile = 'Data/TextFile.txt';
const outputFile = 'Data/TextModerationOutput.txt';

async function sample(client) {
  console.log("1. Evaluate a text file and screen for profanity.");
  let data = fs.readFileSync(textFile, {encoding: "utf8"});
  data = data.replace(os.EOL, " ");
  let writeStream = fs.createWriteStream(outputFile);
  
  // Screen the input text: check for profanity, 
  // do autocorrect text, and check for personally identifying 
  // information (PII)
  writeStream.write("Normalize text and autocorrect typos.\n");
  let screenResult = await client.textModeration.screenText("eng", "text/plain", data, {
    autocorrect: true,
    pII: true
  });
  writeStream.write(JSON.stringify(screenResult, null, 2));
  writeStream.close();
}


exports.sample = sample;