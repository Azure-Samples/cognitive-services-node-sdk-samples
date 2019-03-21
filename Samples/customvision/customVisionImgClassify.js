// Copyright (c) Microsoft. All rights reserved.
'use strict';

const fs = require('fs');
const util = require('util');
const TrainingApiClient = require("azure-cognitiveservices-customvision-training");
const PredictionApiClient = require("azure-cognitiveservices-customvision-prediction");

const setTimeoutPromise = util.promisify(setTimeout);

let trainingKeyVar = 'AZURE_CUSTOM_VISION_TRAINING_KEY';
let predictionKeyVar = 'AZURE_CUSTOM_VISION_PREDICTION_KEY';

if (!process.env[trainingKeyVar]) {
    throw new Error('please set/export the following environment variable: ' + trainingKeyVar);
}
if (!process.env[predictionKeyVar]) {
    throw new Error('please set/export the following environment variable: ' + predictionKeyVar);
}

// This is referenced from the root of the repo.
const sampleDataRoot = "Samples/customvision/images";

const trainingKey = process.env[trainingKeyVar];
const predictionKey = process.env[predictionKeyVar];
const endPoint = "https://southcentralus.api.cognitive.microsoft.com"

const predictionResourceId = "<your prediction resource id>";
const publishIterationName = "classifyModel";

const trainer = new TrainingApiClient(trainingKey, endPoint);

async function sample() {
    // Step 1. Create a Custom Vision Service project
    console.log("Creating project...");
    const  sampleProject = await trainer.createProject("Sample Project")

    // Step 2. Add tags to your project
    const hemlockTag = await trainer.createTag(sampleProject.id, "Hemlock");
    const cherryTag = await trainer.createTag(sampleProject.id, "Japanese Cherry");

    // Step 3. Upload images with tags
    console.log("Adding images...");
    let fileUploadPromises = [];

    const hemlockDir = `${sampleDataRoot}/Hemlock`;
    const hemlockFiles = fs.readdirSync(hemlockDir);
    hemlockFiles.forEach(file => {
        fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`${hemlockDir}/${file}`), { tagIds: [hemlockTag.id] }));
    });

    const cherryDir = `${sampleDataRoot}/Japanese Cherry`;
    const japaneseCherryFiles = fs.readdirSync(cherryDir);
    japaneseCherryFiles.forEach(file => {
        fileUploadPromises.push(trainer.createImagesFromData(sampleProject.id, fs.readFileSync(`${cherryDir}/${file}`), { tagIds: [cherryTag.id] }));
    });

    await Promise.all(fileUploadPromises);

    // Step 4. Train
    console.log("Training...");
    let trainingIteration = await trainer.trainProject(sampleProject.id);

    // Wait for training to complete
    console.log("Training started...");
    while (trainingIteration.status == "Training") {
        console.log("Training status: " + trainingIteration.status);
        await setTimeoutPromise(1000, null);
        trainingIteration = await trainer.getIteration(sampleProject.id, trainingIteration.id)
    }
    console.log("Training status: " + trainingIteration.status);

    // Publish the iteration to the end point
    await trainer.publishIteration(sampleProject.id, trainingIteration.id, publishIterationName, predictionResourceId);

    // Step 5. Prediction
    const predictor = new PredictionApiClient(predictionKey, endPoint);
    const testFile = fs.readFileSync(`${sampleDataRoot}/Test/test_image.jpg`);

    const results = await predictor.classifyImage(sampleProject.id, testFile, publishIterationName);

    // Step 6. Show results
    console.log("Results:");
    results.predictions.forEach(predictedResult => {
        console.log(`\t ${predictedResult.tagName}: ${(predictedResult.probability * 100.0).toFixed(2)}%`);
    });
}

exports.sample = sample