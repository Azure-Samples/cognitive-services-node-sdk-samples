/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

const util = require('util');
const readline = require('readline');

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log();
let samples = {
    EntitySearch: './Samples/entitySearch',
    WebSearch: './Samples/webSearch',
    VideoSearch: './Samples/videoSearch',
    NewsSearch: './Samples/newsSearch',
    ImageSearch: './Samples/imagesearch'
}
const separator = "--------------------------------------------------";
console.log("Hi! Which Search API would you like to sample? Pick one of the following: (CTRL+C to exit)");
console.log(separator);
console.log(Object.keys(samples).join(', '));
console.log(separator);

rl.question('', function(answer) {
  if (samples.hasOwnProperty(answer)) {
    console.log(util.format("Ok, running sample: %s", answer));
    const Sample = require(samples[answer]);
    Sample.sample();
  }
  else {
    console.log(util.format("Sorry, \"%s\" doesn't seem to be a valid sample.", answer))
  }
  rl.close();
});
