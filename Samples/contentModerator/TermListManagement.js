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

const lang = "eng";
const throttleRate = 3000;
const latencyDelay = 0.5;

async function sample(client) {
  try {
    console.log("1. Create a term list and populate with terms.");

    let list_id = await createTermList(client);
    await updateTermList(client, list_id, "name", "description");
    await addTerm(client, list_id, "term1");
    await addTerm(client, list_id, "term2");
    await getAllTerms(client, list_id);

    // Always remember to refresh the search index of your list
    await refreshSearchIndex(client, list_id);

    console.log("2. Screen for the populated terms and delete one term from list.");
    let text = "This text contains the terms \"term1\" and \"term2\".";
    await screenText(client, list_id, text);
    await deleteTerm(client, list_id, "term1");

    // Always remember to refresh the search index of your list
    await refreshSearchIndex(client, list_id);

    console.log("3. Screen for populated terms again and then delete terms and list.");
    await screenText(client, list_id, text);
    await deleteAllTerms(client, list_id);
    await deleteTermList(client, list_id);

    console.log("Done with sample.");
  } catch (err) {
    console.log(err);
  }
}

async function createTermList(client) {
  console.log("Creating term list.");

  let list = await client.listManagementTermLists.create("application/json", {
    name: "Term list name",
    description: "Term list description"
  });
  if (!list.id) {
    throw new Error("TermList.id value missing.");
  } else {
    let list_id = list.id;
    console.log(`Termlist created. ID: ${list_id}`);
    await setTimeoutPromise(throttleRate, null);
    return list_id.toString();
  }
}

async function updateTermList(client, list_id, name, description) {
  console.log(`Updating information for term list with ID ${list_id}.`);
  await client.listManagementTermLists.update(list_id, "application/json", {
    name: name,
    description: description
  });
  await setTimeoutPromise(throttleRate, null);
}

async function addTerm(client, list_id, term) {
  console.log(`Adding term \"${term}\" to term list with ID ${list_id}.`);
  await client.listManagementTerm.addTerm(list_id, term, lang);
  await setTimeoutPromise(throttleRate, null);
}

async function getAllTerms(client, list_id) {
  console.log(`Getting terms in term list with ID ${list_id}.`);
  let terms = await client.listManagementTerm.getAllTerms(list_id, lang);
  let data = terms.data;
  for (let i = 0; i < data.terms.length; i++) {
    console.log(data.terms[i].term);
  }
  await setTimeoutPromise(throttleRate, null);
}

async function refreshSearchIndex(client, list_id) {
  console.log(`Refreshing search index for term list with ID ${list_id}.`);
  await client.listManagementTermLists.refreshIndexMethod(list_id, lang);
  await setTimeoutPromise(Math.round(latencyDelay * 60 * 1000), null);
}

async function screenText(client, list_id, text) {
  console.log(`Screening text: \"${text}\" using term list with ID ${list_id}.`);
  let screen = await client.textModeration.screenText(lang, "text/plain", text, {
    autocorrect: false,
    pII: false,
    listId: list_id
  });
  if (!screen.terms) {
    console.log("No terms from the term list were detected in the text.");
  } else {
    let terms = screen.terms;
    for (let i = 0; i < terms.length; i++) {
      console.log(`Found term: \"${terms[i].term}\" from list ID ${terms[i].listId} at index ${terms[i].index}.`);
    }
  }
  await setTimeoutPromise(throttleRate, null);
}

async function deleteTerm(client, list_id, term){
  console.log(`Removed term \"${term}\" from term list with ID ${list_id}.`);
  await client.listManagementTerm.deleteTerm(list_id, term, lang);
  await setTimeoutPromise(throttleRate);
}

async function deleteAllTerms(client, list_id){
  console.log(`Removing all terms from term list with ID ${list_id}.`);
  await client.listManagementTerm.deleteAllTerms(list_id, lang);
  await setTimeoutPromise(throttleRate, null);
}

async function deleteTermList(client, list_id){
  console.log(`Deleting term list with ID ${list_id}.`);
  await client.listManagementTermLists.deleteMethod(list_id);
  await setTimeoutPromise(throttleRate, null);
}

exports.sample = sample;