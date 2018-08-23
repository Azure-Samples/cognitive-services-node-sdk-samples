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

async function bookingApp(serviceKey) {
    const credentials = new CognitiveServicesCredentials(serviceKey);
    const luisEndpoint = "https://westus.api.cognitive.microsoft.com"
    
    const client = new LUISAuthoringClient(credentials, luisEndpoint)

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

    const appId = await client.apps.add(applicationCreateObject)
    
    console.log("Created app %s", appId)
    console.log("We'll create two new entities.")
    console.log("The \"Destination\" simple entity will hold the flight destination.")
    console.log("The \"Class\" hierarchical entity will accept \"First\", \"Business\" and \"Economy\" values.")
    
    const destinationName = "Destination"
    const simpleEntity = { name: destinationName }
    const destinationId = await client.model.addEntity(appId, versionId, simpleEntity) 
    
    console.log("%s simple entity created with id %s", destinationName, destinationId)

    const className = "Class"
    const hierarchicalEntity = { 
        name: className, 
        children: [ "First", "Business", "Economy" ]
    }

    const classId = await client.model.addHierarchicalEntity(appId, versionId, hierarchicalEntity)
    
    console.log("%s hierarchical entity created with id %s", className, classId)

    const flightName = "Flight"
    console.log("\nWe'll now create the \"Flight\" composite entity including \"Class\" and \"Destination\".")

    const compositeEntity = {
        name: flightName,
        children: [ className, destinationName ]
    }

    const flightId = await client.model.addCompositeEntity(appId, versionId, compositeEntity)

    console.log("%s composite entity created with id %s", flightName, flightId)

    const findEconomyToMadrid = "find flights in economy to Madrid"
    const findFirstToLondon = "find flights to London in first class"

        console.log("\nWe'll create a new \"FindFlights\" intent including the following utterances:")
        console.log(" - %s", findEconomyToMadrid)
        console.log(" - %s", findFirstToLondon)

    const intentName = "FindFlight"
    const intentModel = {
        name: intentName
    }

    const intentId = await client.model.addIntent(appId, versionId, intentModel)
    console.log("%s intent created with id %s", intentName, intentId)

    function getExampleLabel(utterance, entityName, value) {
        const startCharIndex = utterance.toLowerCase().indexOf(value.toLowerCase())

        return {
            entityName: entityName,
            startCharIndex: startCharIndex,
            endCharIndex: startCharIndex + value.length
        }
    }

    const utterances = [{
        text: findEconomyToMadrid,
        intentName: intentName,
        entityLabels: [
            getExampleLabel(findEconomyToMadrid, "Flight", "economy to madrid"),
            getExampleLabel(findEconomyToMadrid, "Destination", "Madrid"),
            getExampleLabel(findEconomyToMadrid, "Class", "economy"),
        ]
    }, {
        text: findFirstToLondon,
        intentName: intentName,
        entityLabels: [
            getExampleLabel(findEconomyToMadrid, "Flight", "London in first class"),
            getExampleLabel(findEconomyToMadrid, "Destination", "London"),
            getExampleLabel(findEconomyToMadrid, "Class", "first"),
        ]
    }]

    await client.examples.batch(appId, versionId, utterances)
    
    console.log("\nUtterances added to the %s intent", intentName)

    console.log("\nWe'll start training your app...")
    await client.train.trainVersion(appId, versionId)

    let isTrained = false
    const checkIfTrained = trainingStatus => trainingStatus.details.status == "UpToDate" || trainingStatus.details.status == "Success"

    do {
        console.log("Waiting until your app is trained...")
        let trainingStatuses = await client.train.getStatus(appId, versionId)
        isTrained = trainingStatuses.every(checkIfTrained)
    } while (!isTrained)

    console.log("Your app is trained. You can now go to the LUIS portal and test it!")
    console.log("\nWe'll start publishing your app...")

    const publishResult = await client.apps.publish(appId, { 
        versionId: versionId,
        isStaging: false,
        region: "westus"
    })

    const endpoint = `${publishResult.endpointUrl}?subscription-key=${serviceKey}&q=`
    console.log("Your app is published. You can now go to test it on\n%s", endpoint)
}

(async () => {
    try {
        await bookingApp(serviceKey);
    } catch (e) {
        console.log(e)
    }
})();