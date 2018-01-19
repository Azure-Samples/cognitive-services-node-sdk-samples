/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
'use strict';

const util = require('util');
const os = require("os");
const async = require('async');
const fs = require('fs');
const setTimeoutPromise = util.promisify(setTimeout);

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

// The initial set of images to add to the list with the sports label.
const imgSports = {
  label: "Sports",
  urls: [
    "https://moderatorsampleimages.blob.core.windows.net/samples/sample4.png",
    "https://moderatorsampleimages.blob.core.windows.net/samples/sample6.png",
    "https://moderatorsampleimages.blob.core.windows.net/samples/sample9.png"
  ]
};

// The initial set of images to add to the list with the swimsuit label.
const imgSwimsuits = {
  label: "Swimsuit",
  urls: [
    "https://moderatorsampleimages.blob.core.windows.net/samples/sample1.jpg",
    "https://moderatorsampleimages.blob.core.windows.net/samples/sample3.png",
    "https://moderatorsampleimages.blob.core.windows.net/samples/sample4.png",
    "https://moderatorsampleimages.blob.core.windows.net/samples/sample16.png"
  ]
};

// The set of images to subsequently remove from the list.
const imgCorrections = [
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample16.png"
];

// The images to match against the image list.
const imagesToMatch = [
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample1.jpg",
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample4.png",
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample5.png",
  "https://moderatorsampleimages.blob.core.windows.net/samples/sample16.png"
];

const throttleRate = 3000;
const latencyDelay = .5;
let imageIdMap = {};
let listDetails;

async function sample(client) {
  console.log("1. This willl create review information using the image.");
  console.log(os.EOL);

  // let creationResult = await createCustomList(client);
  // if (creationResult.id) {
  //   let listId = creationResult.id;
    // Perform various operations using the image list.
    // await addImages(client, listId, imgSports.urls, imgSports.label);
    // await addImages(client, listId, imgSwimsuit.urls, imgSwimsuit.label);

    // GetAllImageIds(client, listId);
    // UpdateListDetails(client, listId);
    // GetListDetails(client, listId);

    // // Be sure to refresh search index
    // RefreshSearchIndex(client, listId);

    // // WriteLine();
    // WriteLine($"Waiting {latencyDelay} minutes to allow the server time to propagate the index changes.", true);
    // Thread.Sleep((int)(latencyDelay * 60 * 1000));

    // // Match images against the image list.
    // MatchImages(client, listId, ImagesToMatch);

    // // Remove images
    // RemoveImages(client, listId, Images.Corrections);

    // // Be sure to refresh search index
    // RefreshSearchIndex(client, listId);

    // WriteLine();
    // WriteLine($"Waiting {latencyDelay} minutes to allow the server time to propagate the index changes.", true);
    // Thread.Sleep((int)(latencyDelay * 60 * 1000));

    // // Match images again against the image list. The removed image should not get matched.
    // MatchImages(client, listId, ImagesToMatch);

    // // Delete all images from the list.
    // DeleteAllImages(client, listId);

    // // Delete the image list.
    // DeleteCustomList(client, listId);

    // // Verify that the list was deleted.
    // GetAllListIds(client);
  // }
  // await getReviewDetails(client);
  // console.log("Perform manual reviews on the Content Moderator site.");
  // console.log(`Waiting ${latencyDelay} seconds for results to propigate.`);
  // await setTimeoutPromise(latencyDelay * 1000, null);
  // await getReviewDetails(client);
}

async function createCustomList(client) {
  listDetails = {
    name: "MyList",
    description: "A sample list",
    metadata: {
      keyOne: "Acceptable",
      keyTwo: "Potentially racy"
    }
  };
  console.log(`Creating list ${listDetails.name}.`);
  let result = await client.listManagementImageLists.create("application/json", listDetails);
  await setTimeoutPromise(throttleRate, null);
  console.log("Response:");
  console.log(JSON.stringify(result, null, 2))
  return result;
}

async function addImages(client, listId, imagesToAdd, label) {
  for (let i = 0; i < imagesToAdd.length; i++) {
    let imageUrl = imagesToAdd[i];
    console.log(os.EOL);
    console.log(`Adding ${imageUrl} to list ${listId} with label ${label}.`);
    try {
      let result = await client.listManagementImage.addImageUrlInput(listId.toString(), "application/json", {
        dataRepresentation: 'URL',
        value: imageUrl
      }, {label: label});

      imageIdMap[imageUrl] = parseInt(result.contentId);
      console.log("Response:");
      console.log(JSON.stringify(result, null, 2))
    } catch (err) {
      console.log("Unable to add image to list.");
      console.log(err);
    } finally {
      await setTimeoutPromise(throttleRate, null);
    }
  }
}

exports.sample = sample;