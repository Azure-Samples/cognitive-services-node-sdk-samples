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
const imgSwimsuit = {
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
  console.log("1. This will create review information using the image.");
  console.log(os.EOL);

  let creationResult = await createCustomList(client);


  if (creationResult.id) {
    let listId = creationResult.id;
    // Perform various operations using the image list.
    await addImages(client, listId, imgSports.urls, imgSports.label);
    await addImages(client, listId, imgSwimsuit.urls, imgSwimsuit.label);

    await getAllImageIds(client, listId);
    await updateListDetails(client, listId);
    await getListDetails(client, listId);

    // Be sure to refresh search index
    await refreshSearchIndex(client, listId);

    // console.log();
    console.log(`Waiting ${latencyDelay} minutes to allow the server time to propagate the index changes.`);
    await setTimeoutPromise(parseInt(latencyDelay * 60 * 1000), null);

    // Match images against the image list.
    await matchImages(client, listId, imagesToMatch);

    // Remove images
    await removeImages(client, listId, imgCorrections);

    // Be sure to refresh search index
    await refreshSearchIndex(client, listId);

    console.log(os.EOL);
    console.log(`Waiting ${latencyDelay} minutes to allow the server time to propagate the index changes.`);
    await setTimeoutPromise(parseInt(latencyDelay * 60 * 1000), null);

    // Match images again against the image list. The removed image should not get matched.
    await matchImages(client, listId, imagesToMatch);

    // Delete all images from the list.
    await deleteAllImages(client, listId);

    // Delete the image list.
    await deleteCustomList(client, listId);

    // Verify that the list was deleted.
    await getAllListIds(client);
  }
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
  try {
    let result = await client.listManagementImageLists.create("application/json", listDetails);
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2))
    return result;
  } catch (err) {
    console.log(err);
  }
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
      }, { label: label });

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

async function removeImages(client, listId, imagesToRemove) {
  for (let i = 0; i < imagesToRemove.length; i++) {
    let imageUrl = imagesToRemove[i];
    if (!imageIdMap.hasOwnProperty(imageUrl)) {
      continue;
    }
    let imageId = imageIdMap[imageUrl];
    console.log(os.EOL);
    console.log(`Removing entry for ${imageUrl} (ID = ${imageId}) from list ${listId}.`);

    try {
      let result = await client.listManagementImage.deleteImage(listId.toString(), imageId.toString());
      await setTimeoutPromise(throttleRate, null);
      delete imageIdMap[imageUrl];
      console.log("Response:");
      console.log(JSON.stringify(result, null, 2));
      return result;
    } catch (err) {
      console.log(err);
    }
  }
}

async function getAllImageIds(client, listId) {
  console.log(os.EOL);
  console.log(`Getting all image IDs for list ${listId}.`);

  try {
    let result = await client.listManagementImage.getAllImageIds(listId.toString());
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function updateListDetails(client, listId) {
  console.log(os.EOL);
  console.log(`Updating details for list ${listId}.`);

  listDetails.name = "Swimsuits and sports";

  try {
    let result = await client.listManagementImageLists.update(listId.toString(), "application/json", listDetails);
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function getListDetails(client, listId) {
  console.log(os.EOL);
  console.log(`Getting details for list ${listId}.`);

  try {
    let result = await client.listManagementImageLists.getDetails(listId.toString());
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function refreshSearchIndex(client, listId) {
  console.log(os.EOL);
  console.log(`Refreshing the search index for list ${listId}.`);

  try {
    let result = await client.listManagementImageLists.refreshIndexMethod(listId.toString());
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function matchImages(client, listId, imagesToMatch) {
  for (let i = 0; i < imagesToMatch.length; i++) {
    let imageUrl = imagesToMatch[i];
    console.log(os.EOL);
    console.log(`Matching image ${imageUrl} against list ${listId}.`);

    try {
      let result = await client.imageModeration.matchUrlInput("application/json", {
        dataRepresentation: 'URL',
        value: imageUrl
      }, listId.toString());
      await setTimeoutPromise(throttleRate, null);
      console.log("Response:");
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.log(err);
    }
  }
}

async function deleteAllImages(client, listId) {
  console.log(os.EOL);
  console.log(`Deleting all images from list ${listId}.`);

  try {
    let result = await client.listManagementImage.deleteAllImages(listId.toString());
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function deleteCustomList(client, listId) {
  console.log(os.EOL);
  console.log(`Deleting list ${listId}.`);

  try {
    let result = await client.listManagementImageLists.deleteMethod(listId.toString());
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function getAllListIds(client) {
  console.log(os.EOL);
  console.log("Getting all image list IDs.");

  try {
    let result = await client.listManagementImageLists.getAllImageLists();
    await setTimeoutPromise(throttleRate, null);
    console.log("Response:");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.log(err);
  }
}

exports.sample = sample;