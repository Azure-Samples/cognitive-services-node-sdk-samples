/* To run this code, install the following modules.
 * 
 * npm install @azure/ms-rest-js
 * npm install -g typescript
 * npm install @azure/cognitiveservices-qnamaker
 * 
 * Then run:
 * tsc publish_kb.ts
 * node publish_kb.js
 */

import * as msRest from "@azure/ms-rest-js";
import * as qnamaker from "@azure/cognitiveservices-qnamaker";

// Replace this with a valid subscription key.
const endpoint = "https://westus.api.cognitive.microsoft.com/";

let keyVar = 'QNAMAKER_SUBSCRIPTION_KEY';
if (!process.env[keyVar]) {
    throw new Error('please set/export the following environment variable: ' + keyVar);
}

// The ID of the KB to publish.
var kb_id = "7bd787d4-ad47-4025-b41d-c5cf23d637a3";

/*
 * The QnAMakerClient constructor expects a parameter 'credentials' of type
 * msRest.ServiceClientCredentials.
 * msRest.ApiKeyCredentials implements ServiceClientCredentials.
 * The ApiKeyCredentials constructor expects a parameter 'options' of type
 * ApiKeyCredentialOptions.
 * ApiKeyCredentialOptions is an interface that defines two fields: inHeader and inQuery.
 * Each is just a set of name/value pairs.
 * 
 * See:
 * QnAMakerClient
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/qnAMakerClient.ts#L17
 * ApiKeyCredentialOptions
 * https://github.com/Azure/ms-rest-js/blob/master/lib/credentials/apiKeyCredentials.ts#L8
 * ApiKeyCredentials
 * https://github.com/Azure/ms-rest-js/blob/master/lib/credentials/apiKeyCredentials.ts#L26
 */
const creds = new msRest.ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': process.env[keyVar] }});
const client = new qnamaker.QnAMakerClient(creds, endpoint);
const kb = new qnamaker.Knowledgebase(client);

/*
 * See:
 * 
 * listAll
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/operations/knowledgebase.ts#L29
 * KnowledgebaseListAllResponse
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L699
 * KnowledgebasesDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L778
 * KnowledgebaseDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L704
 */
function list_kbs() {
    kb.listAll().then((result) => {
        console.log("Existing knowledge bases:\n")
        for (let x of result.knowledgebases) {
            console.log(x.id);
        }
    }).catch(error => {
        throw error;
    });
}

/*
 * See:
 * publish
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/operations/knowledgebase.ts#L109
 */
function publish_kb(kb_id) {
    kb.publish(kb_id).then((result) => {
        console.log("KB " + kb_id + " published.");
    }).catch(error => {
        throw error;
    });
}

try {
    publish_kb(kb_id);
}
catch (error) {
    console.log(error);
}
