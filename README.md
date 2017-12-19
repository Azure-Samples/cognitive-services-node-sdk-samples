# Bing Search SDK Samples

These samples will show you how to get up and running using the SDKs for various Bing Search services. They'll cover a few rudimentary use cases and hopefully express best practices for interacting with the data from these APIs.

## Features

Please note that this samples package references an all-in-one SDK which includes all Bing Search services. Individual packages exist for each service if you would prefer working with smaller assembly sizes. Both individual service packages as well as the all-in-one will have feature parity for a particular service.

This project framework provides examples for the following services:

* Using the **Bing Entity Search SDK** \[[individual package](http://linktopackage)\]\[[complete package](http://linktopackage)\] for the [Entity Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-entity-search-api/)
* Using the **Bing Web Search SDK** \[[individual package](http://linktopackage)\]\[[complete package](http://linktopackage)\] for the [Web Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/)

## Run this sample


1. If you don't already have it, [get node.js](https://nodejs.org).

1. Clone the repository.

    ```
    git clone https://github.com/Azure-Samples/bing-search-node.git

    (the following will be removed once the cognitive-services sdks are published)
    git clone -b cognitiveservices https://github.com/Azure/azure-sdk-for-node.git
    ```

1. Install the dependencies.

    ```
    cd bing-search-node
    npm install
    ```

1. Get a cognitive services API key with which to authenticate the SDK's calls. [Sign up here](https://azure.microsoft.com/en-us/services/cognitive-services/directory/) by navigating to the **Search** services and acquiring an API key. You can get a trial key for **free** which will expire after 30 days.

1. Set the following environment variables using the information from the service principle that you created. You only need to set the environment variables for which you want to run the samples.

    ```
    export AZURE_ENTITY_SEARCH_KEY={your service key}
    export AZURE_WEB_SEARCH_KEY={your service key}
    export AZURE_VIDEO_SEARCH_KEY={your service key}
    export AZURE_NEWS_SEARCH_KEY={your service key}
    export AZURE_IMAGE_SEARCH_KEY={your service key}
    ```

    > [AZURE.NOTE] On Windows, use `set` instead of `export`.

1. Run the sample.

    ```
    node index.js
    ```

1. Navigate through the console app to play with the examples. If a sample ends prematurely and does not return results, please make sure the service-key being used is valid for that service.

To see the code of each example, simply look at the examples in the Samples folder. They are written to be isolated in scope so that you can see only what you're interested in.