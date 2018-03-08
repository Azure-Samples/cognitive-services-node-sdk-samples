# Cognitive Services SDK Samples

These samples will show you how to get up and running using the SDKs for various Cognitive Services. They'll cover a few rudimentary use cases and hopefully express best practices for interacting with the data from these APIs.

## Features

Please note that this samples package references an all-in-one SDK which includes all Bing services. Individual packages exist for each service if you would prefer working with smaller assembly sizes. Both individual service packages as well as the all-in-one will have feature parity for a particular service.

This project framework provides examples for the following services:

* Using the **Bing Entity Search SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-entitysearch)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-search)\] for the [Entity Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-entity-search-api/)
* Using the **Bing Web Search SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-websearch)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-search)\] for the [Web Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/)
* Using the **Bing Video Search SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-videosearch)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-search)\] for the [Video Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-video-search-api/)
* Using the **Bing News Search SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-newssearch)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-search)\] for the [News Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-news-search-api/)
* Using the **Bing Image Search SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-imagesearch)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-search)\] for the [Image Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-image-search-api/)
* Using the **Bing Custom Search SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-customsearch)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-search)\] for the [Custom Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-custom-search/)
* Using the **Bing Spell Check SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-spellcheck)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-language)\] for the [Spell Check API](https://azure.microsoft.com/en-us/services/cognitive-services/spell-check/)
* Using the **Computer Vision SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-computervision)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-vision)\] for the [Computer Vision API](https://azure.microsoft.com/en-us/services/cognitive-services/computer-vision/)
* Using the **Content Moderator SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-contentmoderator)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-vision)\] for the [Content Moderator API](https://azure.microsoft.com/en-us/services/cognitive-services/content-moderator/)
* Using the **Text Analytics SDK** \[[individual package](https://www.npmjs.com/package/azure-cognitiveservices-textanalytics)\]\[[complete package](https://www.npmjs.com/package/azure-cognitiveservices-language)\] for the [Text Analytics API](https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/)


## Run this sample


1. If you don't already have it, [get node.js](https://nodejs.org). Install a version greater than 8.0.

1. Clone the repository.

    ```
    git clone https://github.com/Azure-Samples/cognitive-services-node-sdk-samples.git
    ```

1. Install the dependencies.

    ```
    cd cognitive-services-node-sdk-samples
    npm install
    ```

1. Get a cognitive services API key with which to authenticate the SDK's calls. [Sign up here](https://azure.microsoft.com/en-us/services/cognitive-services/directory/) by navigating to the right service and acquiring an API key. You can get a trial key for **free** which will expire after 30 days.

1. Set the following environment variables using the information from the service principle that you created. You only need to set the environment variables for which you want to run the samples.

    ```
    export AZURE_ENTITY_SEARCH_KEY={your service key}
    export AZURE_WEB_SEARCH_KEY={your service key}
    export AZURE_VIDEO_SEARCH_KEY={your service key}
    export AZURE_NEWS_SEARCH_KEY={your service key}
    export AZURE_IMAGE_SEARCH_KEY={your service key}
    export AZURE_CUSTOM_SEARCH_KEY={your service key}
    export AZURE_SPELL_CHECK_KEY={your service key}
    export AZURE_COMPUTER_VISION_KEY={your service key}
    export AZURE_CONTENT_MODERATOR_KEY={your service key}
    export AZURE_TEXT_ANALYTICS_KEY={your service key}
    ```

    > [AZURE.NOTE] On Windows, use `set` instead of `export`.

1. Run the sample.

    ```
    node index.js
    ```

1. Navigate through the console app to play with the examples. If a sample ends prematurely and does not return results, please make sure the service-key being used is valid for that service.

To see the code of each example, simply look at the examples in the Samples folder. They are written to be isolated in scope so that you can see only what you're interested in.
