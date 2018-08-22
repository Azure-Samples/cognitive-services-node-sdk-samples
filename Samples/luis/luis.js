/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const os = require("os");

const CognitiveServicesCredentials = require('ms-rest-azure').CognitiveServicesCredentials;
const LUISAuthoringClient = require("azure-cognitiveservices-luis-authoring");

const keyVar = 'AZURE_LUIS_KEY';

if (!process.env[keyVar]) {
    throw new Error('please set/export the following environment variable: ' + keyVar);
}

const serviceKey = process.env[keyVar];

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

const credentials = new CognitiveServicesCredentials(serviceKey);
const endpoint = "https://westus.api.cognitive.microsoft.com"

const client = new LUISAuthoringClient(credentials, endpoint)

function sample() {
    const defaultAppName = "Contoso-" + (new Date().getTime())
    const versionId = "0.1"

    console.log("Creating App %s, version %s", defaultAppName, versionId)

    const description = "New App created with LUIS Node.js sample"
    const applicationCreateObject = {
        culture: "en-us",
        initialVersionId: versionId,
        description: description,
        name: defaultAppName,
    }

    client.apps.add(applicationCreateObject).then(appId => {
        console.log("Created app %s", appId)
    })
}

sample()