/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

const readline = require('readline');

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log();
const samples = {
  Search: {
    EntitySearch: './Samples/entitySearch',
    WebSearch: './Samples/webSearch',
    VideoSearch: './Samples/videoSearch',
    NewsSearch: './Samples/newsSearch',
    ImageSearch: './Samples/imageSearch',
    CustomSearch: './Samples/customSearch'
  },
  Vision: {
    ComputerVision: './Samples/computerVision',
    ContentModerator: './Samples/contentModerator'
  },
  // Knowledge: {

  // },
  // Speech: {

  // },
  Language: {
    SpellCheck: './Samples/spellCheck',
    TextAnalytics: './Samples/textAnalytics'
  }
}
const separator = "------------------------------------------------------------------------------------";

askCategory();

function askCategory () {
  console.log("Hi! Which class of Cognitive Services would you like to sample? Pick one of the following: (CTRL+C to exit)");
  console.log(separator);
  console.log(Object.keys(samples).join(', '));
  console.log(separator);
  rl.question('', function(answer) {
    if (samples.hasOwnProperty(answer)) {
      console.log(`You picked: ${answer}`);
      askSample(answer);
    }
    else {
      console.log(`Sorry, \"${answer}\" doesn't seem to be a valid category.`);
      askCategory();
    }
  });
}

function askSample (category) {
  console.log(`Hi! Which ${category} API would you like to sample? Pick one of the following: (CTRL+C to exit)`);
  console.log(separator);
  console.log(Object.keys(samples[category]).join(', '));
  console.log(separator);
  rl.question('', function(answer) {
    if (samples[category].hasOwnProperty(answer)) {
      console.log(`Ok, running samples for ${answer}`);
      const Sample = require(samples[category][answer]);
      Sample.sample();
      rl.close();
    }
    else {
      console.log(`Sorry, \"${answer}\" doesn't seem to be a valid sample.`);
      askSample(category);
    }
  });
}
