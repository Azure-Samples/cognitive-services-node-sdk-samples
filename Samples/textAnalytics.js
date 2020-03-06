/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
// <constStatements>
"use strict";

const os = require("os");
const CognitiveServicesCredentials = require("@azure/ms-rest-js");
const TextAnalyticsAPIClient = require("@azure/cognitiveservices-textanalytics");
// </constStatements> 

// <keyVars>
const key = '<paste-your-text-analytics-key-here>'
const endpoint = `<paste-your-text-analytics-endpoint-here>`;
// </keyVars>

// <authentication>
const creds = new CognitiveServicesCredentials.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
const textAnalyticsClient = new TextAnalyticsAPIClient.TextAnalyticsClient(creds, endpoint);
// </authentication>

// <languageDetection>
async function languageDetection(client) {

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
}
languageDetection(textAnalyticsClient);
// </languageDetection>

// <keyPhraseExtraction>
async function keyPhraseExtraction(client){

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
}
keyPhraseExtraction(textAnalyticsClient);
// </keyPhraseExtraction>

// <sentimentAnalysis>
async function sentimentAnalysis(client){

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
}
sentimentAnalysis(textAnalyticsClient)
// </sentimentAnalysis>

// <entityRecognition>
async function entityRecognition(client){
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
}
entityRecognition(textAnalyticsClient);
// </entityRecognition>
