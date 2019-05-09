/* To run this code, install the following modules.
 * 
 * npm install @azure/ms-rest-js
 * npm install -g typescript
 * npm install @azure/cognitiveservices-qnamaker
 * 
 * Then run:
 * tsc update_kb.ts
 * node update_kb.js
 */

import * as msRest from "@azure/ms-rest-js";
import * as qnamaker from "@azure/cognitiveservices-qnamaker";

// Replace this with a valid subscription key.
const endpoint = "https://westus.api.cognitive.microsoft.com/";

let keyVar = 'QNAMAKER_SUBSCRIPTION_KEY';
if (!process.env[keyVar]) {
    throw new Error('please set/export the following environment variable: ' + keyVar);
}

// The ID of the KB to update.
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
 * 
 * UpdateKbOperationDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L107
 * UpdateKbOperationDTOAdd (simply extends CreateKbInputDTO)
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L35
 * CreateKbInputDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L14
 * UpdateKbOperationDTODelete (simply extends DeleteKbContentsDTO)
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L64
 * DeleteKbContentsDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L46
 * UpdateKbOperationDTOUpdate (simply extends UpdateKbContentsDTO)
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L97
 * UpdateKbContentsDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/index.ts#L74
 * QnADTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L363
 * MetadataDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L331
 * FileDTO
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/models/mappers.ts#L423
 */

// Add new Q&A lists, URLs, and files to the KB.
var answer = "You can change the default message if you use the QnAMakerDialog. See this for details: https://docs.botframework.com/en-us/azure-bot-service/templates/qnamaker/#navtitle";
var source = "Custom Editorial";
var questions = ["How can I change the default message from QnA Maker?"];
var metadata = [{ Name: "category", Value: "api" }];
var qna_list = [{ id: 1, answer: answer, Source: source, questions: questions, Metadata: metadata }];
var update_kb_add_payload = { qnaList: qna_list, urls: [], files: [] };

// Update the KB name.
var name = "New KB name";
var update_kb_update_payload = { name: name };

// Delete the QnaList with ID 0.
var ids = [0];
var update_kb_delete_payload = { ids: ids };

// Bundle the add, update, and delete requests.
var update_kb_payload = { add: update_kb_add_payload, update: update_kb_update_payload, deleteProperty: update_kb_delete_payload };

/*
 * See:
 * update
 * https://github.com/Azure/azure-sdk-for-js/blob/master/sdk/cognitiveservices/cognitiveservices-qnamaker/src/operations/knowledgebase.ts#L169
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

function update_kb(kb_id) {
    kb.update(kb_id, update_kb_payload).then((result) => {
        console.log("Waiting for KB update operation to finish...");
        wait_for_operation(result._response.parsedBody.operationId);
    }).catch(error => {
        throw error;
    });
}

try {
    update_kb(kb_id);
}
catch (error) {
    console.log(error);
}
