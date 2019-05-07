/* To run this code, install the following modules.
 * 
 * npm install @azure/ms-rest-js
 * npm install -g typescript
 * npm install @azure/cognitiveservices-qnamaker
 * 
 * Then run:
 * tsc create_kb.ts
 * node create_kb.js
 */

import * as msRest from "@azure/ms-rest-js";
import * as qnamaker from "@azure/cognitiveservices-qnamaker";

// Replace this with a valid subscription key.
const endpoint = "https://westus.api.cognitive.microsoft.com/";

let keyVar = 'QNAMAKER_SUBSCRIPTION_KEY';
if (!process.env[keyVar]) {
    throw new Error('please set/export the following environment variable: ' + keyVar);
}

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
const client = new qnamaker.QnAMakerClient(endpoint, creds);
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
 * 
 * deleteMethod
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/operations/knowledgebase.ts#L81
 */
// Delete the specified KB. You can use this method to delete excess KBs created with this quickstart.
function delete_kb(kb_id) {
    kb.deleteMethod(kb_id).then(() => {
        console.log("KB " + kb_id + " deleted.");
    }).catch(error => {
        throw error;
    });
}

/*
 * See:
 * CreateKbDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L473
 * QnADTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L363
 * MetadataDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L331
 * FileDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L423
 */
var answer = "You can use our REST APIs to manage your Knowledge Base. See here for details: https://westus.dev.cognitive.microsoft.com/docs/services/58994a073d9e04097c7ba6fe/operations/58994a073d9e041ad42d9baa";
var source = "Custom Editorial";
var questions = ["How do I programmatically update my Knowledge Base?"];
var metadata = [{ Name: "category", Value: "api" }];
var qna_list = [{ id: 0, answer: answer, Source: source, questions: questions, Metadata: metadata }];

var create_kb_payload = {
    name: 'QnA Maker FAQ',
    qnaList: qna_list,
    urls: [],
    files: []
}

/*
 * See:
 * 
 * create
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/operations/knowledgebase.ts#L201
 * KnowledgebaseCreateResponse
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L760
 * Operation
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L421
 * getDetails
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/operations/operations.ts#L29
 * OperationsGetDetailsResponse
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L798
 */
function wait_for_operation(operation_id) {
    client.operations.getDetails(operation_id).then((result) => {
        var state = result._response.parsedBody.operationState;
        if ("Running" === state || "NotStarted" === state) {
            console.log("Operation is not finished. Waiting 10 seconds...");
            setTimeout(function () {
                wait_for_operation(operation_id);
            }, 10000);
        } else {
            console.log("Operation result: " + state + "\n");
            if ("Failed" === state) {
                console.log(result._response.parsedBody.errorResponse);
            }
        }
    }).catch(error => {
        throw error;
    });
}

function create_kb() {
    kb.create(create_kb_payload).then((result) => {
        console.log("Waiting for KB create operation to finish...");
        wait_for_operation(result._response.parsedBody.operationId);
    }).catch(error => {
        throw error;
    });
}

try {
    create_kb();
}
catch (error) {
    console.log(error);
}

