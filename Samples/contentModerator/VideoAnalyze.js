/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */
"use strict";

const os = require("os");
const async = require("async");
const util = require("util");
const uuidv4 = require("uuid/v4");
const path = require("path");
const url = require("url");
const fs = require("fs");

const { AzureMediaServices } = require("@azure/arm-mediaservices");
const {
  BlobServiceClient,
  AnonymousCredential,
} = require("@azure/storage-blob");
const { ClientSecretCredential } = require("@azure/identity");

const setTimeoutPromise = util.promisify(setTimeout);

// endpoint config
// make sure your URL values end with '/'

const armEndpoint = "https://management.azure.com/";
const subscriptionId = "00000000-0000-0000-0000-000000000000";
const accountName = "amsaccount";
const region = "West US 2";
const aadClientId = "00000000-0000-0000-0000-000000000000";
const aadSecret ="00000000-0000-0000-0000-000000000000";
const aadTenantId ="00000000-0000-0000-0000-000000000000";
const resourceGroup = "amsResourceGroup";

// args
const outputFolder = "outputs";
const namePrefix = "prefix";

// You can either specify a local input file with the inputFile or an input Url with inputUrl.  Set the other one to null.
// const inputUrl = null;
// const inputFile = "c:\\temp\\input.mp4";
const inputFile = null;
const inputUrl = "https://shigeyfampdemo.azurewebsites.net/videos/ignite.mp4";

// These are the names used for creating and finding your transforms
const videoAnalyzerTransformName = "MyVideoAnalyzerTransformName";

// constants
const timeoutSeconds = 60 * 10;
const sleepInterval = 1000 * 15;

let azureMediaServicesClient;
let inputExtension;
let blobName = null;

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

async function sample(client) {
  try {
    const credentials = new ClientSecretCredential(
      aadTenantId,
      aadClientId,
      aadSecret
    );
    azureMediaServicesClient = new AzureMediaServices(
      credentials,
      subscriptionId,
      { endpoint: armEndpoint, retryOptions: { maxRetries: 0 } }
    );

    console.log("creating video analyzer transform...");
    let videoAnalyzerTransform = await ensureTransformExists(
      resourceGroup,
      accountName,
      videoAnalyzerTransformName,
      videoAnalyzerPreset()
    );

    console.log("getting job input from arguments...");
    let uniqueness = uuidv4();
    let input = await getJobInputFromArguments(
      resourceGroup,
      accountName,
      uniqueness
    );
    let outputAssetName = namePrefix + "-output-" + uniqueness;
    let jobName = namePrefix + "-job-" + uniqueness;

    console.log("creating output asset...");
    let outputAsset = await createOutputAsset(
      resourceGroup,
      accountName,
      outputAssetName
    );

    console.log("submitting job...");
    let job = await submitJob(
      resourceGroup,
      accountName,
      videoAnalyzerTransformName,
      jobName,
      input,
      outputAsset.name
    );

    console.log("waiting for job to finish...");
    job = await waitForJobToFinish(
      resourceGroup,
      accountName,
      videoAnalyzerTransformName,
      jobName
    );

    if (job.state == "Finished") {
      await downloadResults(
        resourceGroup,
        accountName,
        outputAsset.name,
        outputFolder
      );

      console.log("deleting jobs and assets...");
      await azureMediaServicesClient.jobs.delete(
        resourceGroup,
        accountName,
        videoAnalyzerTransformName,
        jobName
      );
      let jobInputAsset = input;
      if (jobInputAsset && jobInputAsset.assetName) {
        await azureMediaServicesClient.assets.delete(
          resourceGroup,
          accountName,
          jobInputAsset.assetName
        );
      }
      await azureMediaServicesClient.assets.delete(
        resourceGroup,
        accountName,
        outputAsset.name
      );
    } else if (job.state == "Error") {
      console.log(`${job.name} failed. Error details:`);
      console.log(job.outputs[0].error);
    } else if (job.state == "Canceled") {
      console.log(`${job.name} was unexpectedly canceled.`);
    } else {
      console.log(
        `${job.name} is still in progress.  Current state is ${job.state}.`
      );
    }
    console.log("done with sample");
  } catch (err) {
    console.log(err);
  }
}

function videoAnalyzerPreset() {
  return {
    audioLanguage: null,
    odataType: "#Microsoft.Media.VideoAnalyzerPreset",
  };
}

async function ensureTransformExists(
  resourceGroup,
  accountName,
  transformName,
  preset
) {
  await azureMediaServicesClient.transforms.createOrUpdate(
    resourceGroup,
    accountName,
    transformName,
    {
      name: transformName,
      location: region,
      outputs: [
        {
          preset: preset,
        },
      ],
    }
  );
  const transform = await azureMediaServicesClient.transforms.get(
    resourceGroup,
    accountName,
    transformName
  );
  return transform;
}

async function getJobInputFromArguments(
  resourceGroup,
  accountName,
  uniqueness
) {
  if (inputFile) {
    let assetName = namePrefix + "-input-" + uniqueness;
    await createInputAsset(resourceGroup, accountName, assetName, inputFile);
    return {
      odataType: "#Microsoft.Media.JobInputAsset",
      assetName: assetName,
    };
  } else {
    return {
      odataType: "#Microsoft.Media.JobInputHttp",
      files: [inputUrl],
    };
  }
}

async function createInputAsset(
  resourceGroup,
  accountName,
  assetName,
  fileToUpload
) {
  let asset = await azureMediaServicesClient.assets.createOrUpdate(
    resourceGroup,
    accountName,
    assetName,
    {}
  );
  let date = new Date();
  date.setHours(date.getHours() + 1);
  let input = {
    permissions: "ReadWrite",
    expiryTime: date,
  };
  let response = await azureMediaServicesClient.assets.listContainerSas(
    resourceGroup,
    accountName,
    assetName,
    input
  );
  let uploadSasUrl = response.assetContainerSasUrls[0] || null;
  let fileName = path.basename(fileToUpload);
  let sasUri = url.parse(uploadSasUrl);
  let sharedBlobService = new BlobServiceClient(
    `https://${sasUri.host}${sasUri.search}`,
    new AnonymousCredential()
  );
  let containerName = sasUri.pathname.replace(/^\/+/g, "");
  let randomInt = Math.round(Math.random() * 100);
  blobName = fileName + randomInt;
  console.log("uploading to blob...");
  async function createBlobPromise() {
    let containerClient = sharedBlobService.getContainerClient(containerName);
    let blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return await blockBlobClient.uploadFile(fileToUpload);
  }
  await createBlobPromise();
  return await azureMediaServicesClient.assets.get(
    resourceGroup,
    accountName,
    assetName
  );
}

async function createOutputAsset(resourceGroup, accountName, assetName) {
  await azureMediaServicesClient.assets.createOrUpdate(
    resourceGroup,
    accountName,
    assetName,
    {}
  );
  return await azureMediaServicesClient.assets.get(
    resourceGroup,
    accountName,
    assetName
  );
}

async function submitJob(
  resourceGroup,
  accountName,
  transformName,
  jobName,
  jobInput,
  outputAssetName
) {
  let jobOutputs = [
    {
      odataType: "#Microsoft.Media.JobOutputAsset",
      assetName: outputAssetName,
    },
  ];
  await azureMediaServicesClient.jobs.create(
    resourceGroup,
    accountName,
    transformName,
    jobName,
    {
      input: jobInput,
      outputs: jobOutputs,
    }
  );
  return await azureMediaServicesClient.jobs.get(
    resourceGroup,
    accountName,
    transformName,
    jobName
  );
}

async function waitForJobToFinish(
  resourceGroup,
  accountName,
  transformName,
  jobName
) {
  let timeout = new Date();
  timeout.setSeconds(timeout.getSeconds() + timeoutSeconds);

  async function pollForJobStatus() {
    let job = await azureMediaServicesClient.jobs.get(
      resourceGroup,
      accountName,
      transformName,
      jobName
    );
    console.log(job.state);
    if (
      job.state == "Finished" ||
      job.state == "Error" ||
      job.state == "Canceled"
    ) {
      return job;
    } else if (new Date() > timeout) {
      console.log(`Job ${job.name} timed out.`);
      return job;
    } else {
      await setTimeoutPromise(sleepInterval, null);
      return pollForJobStatus();
    }
  }
  return await pollForJobStatus();
}

async function downloadResults(
  resourceGroup,
  accountName,
  assetName,
  resultsFolder
) {
  try {
    fs.mkdirSync(resultsFolder);
  } catch (err) {
    // directory exists
  }

  let date = new Date();
  date.setHours(date.getHours() + 1);
  let input = {
    permissions: "Read",
    expiryTime: date,
  };
  let assetContainerSas =
    await azureMediaServicesClient.assets.listContainerSas(
      resourceGroup,
      accountName,
      assetName,
      input
    );

  let containerSasUrl = assetContainerSas.assetContainerSasUrls[0] || null;
  let sasUri = url.parse(containerSasUrl);
  let sharedBlobService = new BlobServiceClient(
    `https://${sasUri.host}${sasUri.search}`,
    new AnonymousCredential()
  );
  let containerName = sasUri.pathname.replace(/^\/+/g, "");
  let directory = path.join(resultsFolder, assetName);
  try {
    fs.mkdirSync(directory);
  } catch (err) {
    // directory exists
  }
  console.log(`gathering blobs in container ${containerName}...`);
  const containerClient = sharedBlobService.getContainerClient(containerName);
  async function createBlobListPromise() {
    return containerClient.listBlobsFlat();
  }
  let blobs = await createBlobListPromise();
  console.log("downloading blobs to local directory in background...");
  for await (const blob of blobs) {
    if (blob.properties.blobType == "BlockBlob") {
      console.log(blob.name);
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      await blockBlobClient.downloadToFile(path.join(directory, blob.name));
    }
  }
}

exports.sample = sample;
