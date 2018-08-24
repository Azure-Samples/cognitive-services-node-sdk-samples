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

const subscriptionKey = process.env[keyVar];

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

/**
 * Authoring sample.
 * This will create a LUIS Booking application, train and publish it.
 * @param {string} subscriptionKey 
 */
async function bookingApp(subscriptionKey) {
    const credentials = new CognitiveServicesCredentials(subscriptionKey);
    const client = new LUISAuthoringClient(credentials, "https://westus.api.cognitive.microsoft.com")

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

    const hierarchicalEntity = {
        name: "Class",
        children: ["First", "Business", "Economy"]
    }

    const classId = await client.model.addHierarchicalEntity(appId, versionId, hierarchicalEntity)

    console.log("%s hierarchical entity created with id %s", hierarchicalEntity.name, classId)

    console.log("\nWe'll now create the \"Flight\" composite entity including \"Class\" and \"Destination\".")

    const compositeEntity = {
        name: "Flight",
        children: [hierarchicalEntity.name, destinationName]
    }

    const flightId = await client.model.addCompositeEntity(appId, versionId, compositeEntity)

    console.log("%s composite entity created with id %s", compositeEntity.name, flightId)

    const findEconomyToMadrid = "find flights in economy to Madrid"
    const findFirstToLondon = "find flights to London in first class"
    const intentModel = {
        name: "FindFlight"
    }

    console.log(`\nWe'll create a new \"${intentModel.name}\" intent including the following utterances:`)
    console.log(" - %s", findEconomyToMadrid)
    console.log(" - %s", findFirstToLondon)

    const intentId = await client.model.addIntent(appId, versionId, intentModel)
    console.log("%s intent created with id %s", intentModel.name, intentId)

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
        intentName: intentModel.name,
        entityLabels: [
            getExampleLabel(findEconomyToMadrid, "Flight", "economy to madrid"),
            getExampleLabel(findEconomyToMadrid, "Destination", "Madrid"),
            getExampleLabel(findEconomyToMadrid, "Class", "economy"),
        ]
    }, {
        text: findFirstToLondon,
        intentName: intentModel.name,
        entityLabels: [
            getExampleLabel(findEconomyToMadrid, "Flight", "London in first class"),
            getExampleLabel(findEconomyToMadrid, "Destination", "London"),
            getExampleLabel(findEconomyToMadrid, "Class", "first"),
        ]
    }]

    await client.examples.batch(appId, versionId, utterances)

    console.log("\nUtterances added to the %s intent", intentModel.name)

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

    const endpoint = `${publishResult.endpointUrl}?subscription-key=${subscriptionKey}&q=`
    console.log("Your app is published. You can now go to test it on\n%s", endpoint)
}

/**
 * Managing
 * This will show how to manage your LUIS applications.
 * @param {string} serviceKey 
 */
async function management(serviceKey) {
    const credentials = new CognitiveServicesCredentials(serviceKey);
    const luisEndpoint = "https://westus.api.cognitive.microsoft.com"

    const client = new LUISAuthoringClient(credentials, luisEndpoint)

    // Create a LUIS app
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

    // List app
    console.log("\nList all apps")
    const apps = await client.apps.list()
    apps.forEach(app => { console.log(app.name) })

    // Cloning a version
    console.log("\nCloning version 0.1 into 0.2")
    await client.versions.clone(appId, "0.1", { versionCloneObject: { version: "0.2" } })
    console.log("Your app version has been cloned.")

    // Export the version
    console.log("\nExport version 0.2 as JSON")
    const luisApp = await client.versions.exportMethod(appId, "0.2")
    const luisAppAsJson = JSON.stringify(luisApp)
    // You can now save this JSON string as a file

    // Import the version
    console.log("\nImport previously exported version as 0.3")
    await client.versions.importMethod(appId, JSON.parse(luisAppAsJson), { versionId: "0.3" })

    // Listing versions
    console.log("\nList all versions in this app")
    const versions = await client.versions.list(appId)
    versions.forEach(version => {
        console.log(`\t->Version: '${version.version}', training status: ${version.trainingStatus}`)
    })

    // Print app details
    console.log(`\nPrint app \"${defaultAppName}\" details`)
    const appDetails = await client.apps.get(appId)
    console.log(appDetails)

    // Print version details
    console.log(`\nPrint version \"${versionId}\" details`)
    const versionDetails = await client.versions.get(appId, versionId)
    console.log(versionDetails)

    // Delete an app
    console.log(`\nDelete app \"${defaultAppName}\"`)
    await client.apps.deleteMethod(appId)
    console.log("App deleted!")
}

(async () => {
    try {
        await bookingApp(subscriptionKey);
        await management(subscriptionKey);
    } catch (e) {
        console.log(e)
    }
})();