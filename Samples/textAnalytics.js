/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
"use strict";

const os = require("os");
const TextAnalyticsAPIClient = require("azure-cognitiveservices-textanalytics");
const CognitiveServicesCredentials = require("ms-rest-azure").CognitiveServicesCredentials;

let keyVar = 'AZURE_TEXT_ANALYTICS_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let client = new TextAnalyticsAPIClient(
  credentials,
  "https://westus.api.cognitive.microsoft.com/"
);

async function sample() {
  // *****Language Detection Example*****
  console.log("1. This will detect the languages of the inputs.");
  const languageInput = {
    documents: [
      { id: "1", text: "This is a document written in English." },
      { id: "2", text: "Este es un document escrito en Español." },
      { id: "3", text: "这是一个用中文写的文件" }
    ]
  };

  const languageResult = await client.detectLanguage({
    languageBatchInput: languageInput
  });

  languageResult.documents.forEach(document => {
    console.log(`ID: ${document.id}`);
    document.detectedLanguages.forEach(language =>
      console.log(`\tLanguage ${language.name}`)
    );
  });
  console.log(os.EOL);

  // *****Key Phrase Extraction Example*****
  console.log("2. This will extract key phrases from the sentences.");
  const keyPhrasesInput = {
    documents: [
      { language: "ja", id: "1", text: "猫は幸せ" },
      {
        language: "de",
        id: "2",
        text: "Fahrt nach Stuttgart und dann zum Hotel zu Fu."
      },
      {
        language: "en",
        id: "3",
        text: "My cat might need to see a veterinarian."
      },
      { language: "es", id: "4", text: "A mi me encanta el fútbol!" }
    ]
  };

  const keyPhraseResult = await client.keyPhrases({
    multiLanguageBatchInput: keyPhrasesInput
  });
  console.log(keyPhraseResult.documents);
  console.log(os.EOL);

  // *****Sentiment Analysis Example*****
  console.log("3. This will perform sentiment analysis on the sentences.");

  const sentimentInput = {
    documents: [
      { language: "en", id: "1", text: "I had the best day of my life." },
      {
        language: "en",
        id: "2",
        text: "This was a waste of my time. The speaker put me to sleep."
      },
      {
        language: "es",
        id: "3",
        text: "No tengo dinero ni nada que dar..."
      },
      {
        language: "it",
        id: "4",
        text:
          "L'hotel veneziano era meraviglioso. È un bellissimo pezzo di architettura."
      }
    ]
  };

  const sentimentResult = await client.sentiment({
    multiLanguageBatchInput: sentimentInput
  });
  console.log(sentimentResult.documents);
  console.log(os.EOL);

  // *****Entity Recognition Example*****
  console.log("3. This will perform Entity recognition on the sentences.");

  const entityInputs = {
    documents: [
      {
        language: "en",
        id: "1",
        text:
          "Microsoft was founded by Bill Gates and Paul Allen on April 4, 1975, to develop and sell BASIC interpreters for the Altair 8800"
      },
      {
        language: "es",
        id: "2",
        text:
          "La sede principal de Microsoft se encuentra en la ciudad de Redmond, a 21 kilómetros de Seattle."
      }
    ]
  };

  const entityResults = await client.entities({
    multiLanguageBatchInput: entityInputs
  });

  entityResults.documents.forEach(document => {
    console.log(`Document ID: ${document.id}`);
    document.entities.forEach(e => {
      console.log(`\tName: ${e.name} Type: ${e.type} Sub Type: ${e.type}`);
      e.matches.forEach(match =>
        console.log(
          `\t\tOffset: ${match.offset} Length: ${match.length} Score: ${
            match.entityTypeScore
          }`
        )
      );
    });
  });

  console.log(os.EOL);
  console.log("Finished running Spell-Check sample.");
}

exports.sample = sample;
