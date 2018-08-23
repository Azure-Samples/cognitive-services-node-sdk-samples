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

    const batchPromise = Promise.all([ appCreationPromise, classCreationPromise, flightCreationPromise, intentCreationPromise ]).then(ids => {
        const appId = ids[0]
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

        return client.examples.batch(appId, versionId, utterances)
    }).catch(errorHandler)
    
    batchPromise.then(_ => {
        console.log("\nUtterances added to the %s intent", intentName)
    }).catch(errorHandler)

    const trainPromise = Promise.all([ appCreationPromise, batchPromise ]).then(ids => {
        console.log("\nWe'll start training your app...")
        const appId = ids[0]
        return client.train.trainVersion(appId, versionId)
    }).catch(errorHandler)

    const isTrainedPromise = Promise.all([ appCreationPromise, trainPromise ]).then(ids => { 
        const appId = ids[0]
        return new Promise((resolve, reject) => {
            let isTrained = false
            const checkIfTrained = trainingStatus => trainingStatus.details.status == "UpToDate" || trainingStatus.details.status == "Success"

            const poll = () => {
                console.log("Polling...")
                client.train.getStatus(appId, versionId).then(trainingStatuses => {
                    isTrained = trainingStatuses.every(checkIfTrained) 
                    if (isTrained) {
                        resolve(trainingStatuses)
                    } else {
                        setTimeout(poll, 5000)
                    }
                });
            }

            poll()
        })
    }).catch(errorHandler)

    isTrainedPromise.then(_ => console.log(_)).catch(errorHandler)

    const publishPromise = Promise.all([ appCreationPromise, isTrainedPromise ]).then(ids => {
        console.log("Your app is trained. You can now go to the LUIS portal and test it!")
        console.log("\nWe'll start publishing your app...")

        const appId = ids[0]
        return client.apps.publish(appId, { 
            versionId: versionId,
            isStaging: false,
            region: "westus"
        })
    }).catch(errorHandler)

    publishPromise.then(publishResult => {
        const endpoint = `${publishResult.endpointUrl}?subscription-key=${serviceKey}&q=`
        console.log("Your app is published. You can now go to test it on\n%s", endpoint)
    }).catch(errorHandler)
}

sample()