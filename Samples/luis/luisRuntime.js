/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const os = require("os");

const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const LUISRuntimeClient = require("azure-cognitiveservices-luis-runtime");

const keyVar = 'AZURE_LUIS_KEY';

if (!process.env[keyVar]) {
    throw new Error('please set/export the following environment variable: ' + keyVar);
}

const subscriptionKey = process.env[keyVar];

/**
 * Resolve.
 * This will execute LUIS prediction
 * @param {string} subscriptionKey 
 */
async function runtime(subscriptionKey) {
    const credentials = new CognitiveServicesCredentials(subscriptionKey);
    const client = new LUISRuntimeClient(credentials, "https://westus.api.cognitive.microsoft.com")

    const query = "Look for hotels near LAX airport"
    const appId = "00000000-0000-0000-0000-000000000000"
    
    console.log(`Executing query: ${query}`)
    const result = await client.prediction.resolve(appId, query)

    console.log(`\nDetected intent: ${result.topScoringIntent.intent} (score: ${(result.topScoringIntent.score * 100).toFixed(2)}%)`)
    console.log("Detected entities:")
    result.entities.forEach(entity => {
        console.log(`\t-> Entity '${entity.entity}' (type: ${entity.type}, score: ${(entity["score"]*100).toFixed(2)}%)`)
    })

    console.log("\nComplete result object as dictionnary")
    console.log(JSON.stringify(result))
}

(async () => {
    try {
        await runtime(subscriptionKey);
    } catch (e) {
        console.log(e)
    }
})();