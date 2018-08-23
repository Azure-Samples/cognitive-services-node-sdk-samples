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

    const errorHandler = error => console.log(error)
    const appCreationPromise = client.apps.add(applicationCreateObject)
    
    appCreationPromise.then(appId => {
        console.log("Created app %s", appId)
        console.log("We'll create two new entities.")
        console.log("The \"Destination\" simple entity will hold the flight destination.")
        console.log("The \"Class\" hierarchical entity will accept \"First\", \"Business\" and \"Economy\" values.")
    })
    
    const destinationName = "Destination"
    const destinationCreationPromise = appCreationPromise.then(appId => {
        const simpleEntity = { name: destinationName }
        return client.model.addEntity(appId, versionId, simpleEntity) 
    })
    
    destinationCreationPromise.then(destinationId => {
        console.log("%s simple entity created with id %s", destinationName, destinationId)
    }).catch(errorHandler)

    const className = "Class"
    const classCreationPromise = appCreationPromise.then(appId => {
        const hierarchicalEntity = { 
            name: className, 
            children: [ "First", "Business", "Economy" ]
        }

        return client.model.addHierarchicalEntity(appId, versionId, hierarchicalEntity)
    }).catch(errorHandler)
    
    classCreationPromise.then(classId => {
        console.log("%s hierarchical entity created with id %s", className, classId)
    }).catch(errorHandler)

    const flightName = "Flight"
    const flightCreationPromise = Promise.all([ appCreationPromise, destinationCreationPromise, classCreationPromise ]).then(ids => {
        const appId = ids[0]
        console.log("\nWe'll now create the \"Flight\" composite entity including \"Class\" and \"Destination\".")

        const compositeEntity = {
            name: flightName,
            children: [ className, destinationName ]
        }

        return client.model.addCompositeEntity(appId, versionId, compositeEntity)
    }).catch(errorHandler)

    flightCreationPromise.then(flightId => {
        console.log("%s composite entity created with id %s", flightName, flightId)
    }).catch(errorHandler)

    const findEconomyToMadrid = "find flights in economy to Madrid"
    const findFirstToLondon = "find flights to London in first class"
    flightCreationPromise.then(_ => {
        console.log("\nWe'll create a new \"FindFlights\" intent including the following utterances:")
        console.log(" - %s", findEconomyToMadrid)
        console.log(" - %s", findFirstToLondon)
    }).catch(errorHandler)

    const intentName = "FindFlight"
    const intentCreationPromise = appCreationPromise.then(appId => {
        const intentModel = {
            name: intentName
        }
        return client.model.addIntent(appId, versionId, intentModel)
    }).catch(errorHandler)

    intentCreationPromise.then(intentId => {
        console.log("%s intent created with id %s", intentName, intentId)
    }).catch(errorHandler)
}

sample()