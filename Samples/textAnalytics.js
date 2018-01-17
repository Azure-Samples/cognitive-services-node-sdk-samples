/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const os = require("os");
const async = require('async');
const Language = require('azure-cognitiveservices-language');
const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;

let keyVar = 'AZURE_TEXT_ANALYTICS_KEY';

if (!process.env[keyVar]) {
  throw new Error('please set/export the following environment variable: ' + keyVar);
}

let serviceKey = process.env[keyVar];


///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

let credentials = new CognitiveServicesCredentials(serviceKey);
let textAnalyticsApiClient = new Language.TextAnalyticsAPIClient(credentials, 'westus');

function sample() {
  async.series([
    async function () {
      console.log("1. This will detect the languages of the inputs.");

      let result = await textAnalyticsApiClient.detectLanguage({
        documents: [
          {
            'id': "1",
            'text': "This is a document written in English."
          },
          {
            'id': "2",
            'text': "Este es un document escrito en Español.."
          },
          {
            'id': "3",
            'text': "这是一个用中文写的文件"
          }
        ]
      });

      if (result.documents.length > 0){
        for (let i=0; i < result.documents.length; i++) {
          console.log(`Document ID: ${result.documents[i].id} , Language: ${result.documents[i].detectedLanguages[0].name}`);
        }
      } else {
        console.log("No results data..");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("2. This will extract key phrases from the sentences.");

      let result = await textAnalyticsApiClient.keyPhrases({
        documents: [
          {
            'language': 'ja',
            'id': "1",
            'text': "猫は幸せ"
          },
          {
            'language': 'de',
            'id': "2",
            'text': "Fahrt nach Stuttgart und dann zum Hotel zu Fu."
          },
          {
            'language': 'en',
            'id': "3",
            'text': "My cat is stiff as a rock."
          },
          {
            'language': 'es',
            'id': "4",
            'text': "A mi me encanta el fútbol!"
          }
        ]
      });

      if (result.documents.length > 0){
        for (let i=0; i < result.documents.length; i++) {
          let document = result.documents[i];
          console.log(`Document ID: ${document.id}`);
          console.log(`\t Key phrases:`);
          for (let j=0; j < document.keyPhrases.length; j++) {
            console.log(`\t\t${document.keyPhrases[j]}`);
          }
        }
      } else {
        console.log("No results data..");
      }
    },
    async function () {
      console.log(os.EOL);
      console.log("3. This will perform sentiment analysis on the sentences.");

      let result = await textAnalyticsApiClient.sentiment({
        documents: [
          {
            'language': 'en',
            'id': "0",
            'text': "I had the best day of my life."
          },
          {
            'language': 'en',
            'id': "1",
            'text': "This was a waste of my time. The speaker put me to sleep."
          },
          {
            'language': 'es',
            'id': "2",
            'text': "No tengo dinero ni nada que dar..."
          },
          {
            'language': 'it',
            'id': "3",
            'text': "L'hotel veneziano era meraviglioso. È un bellissimo pezzo di architettura."
          }
        ]
      });

      if (result.documents.length > 0){
        for (let i=0; i < result.documents.length; i++) {
          let document = result.documents[i];
          console.log(`Document ID: ${document.id} , Sentiment Score: ${document.score}`);
        }
      } else {
        console.log("No results data..");
      }
    },
    function () {
      return new Promise((resolve) => {
        console.log(os.EOL);
        console.log("Finished running Spell-Check sample.");
        resolve();
      })
    }
  ], (err) => {
    throw (err);
  });
}

exports.sample = sample;
