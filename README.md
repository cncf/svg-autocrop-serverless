What is this:
A repo for a serverless (gcloud functions) api of svg-autocrop.

Install: npm install, at this moment a nodejs v10 is used

Debug locally: functions-framework --target=autocrop1

where autocrop1 is a function name from an index.js

Deploy: gcloud functions deploy --runtime=nodejs10 --region=us-central1 --trigger-http autocrop1

# Example API Usage:

```
        const baseUrl = 'https://us-central1-cncf-svg-autocrop.cloudfunctions.net/autocrop';
        const rp = require('request-promise');
        const input = require('fs').readFileSync(`node_modules/svg-autocrop/fixtures/f5.input.svg`, 'utf-8');
        const response = await rp({
            method: 'POST',
            body: {"svg": input, title: "new title"},
            uri: baseUrl,
            json: true
        }); 
        console.info(response);
```
output: `{ success : true, result: '<svg ...', stats: { originalSize: 1000, transformedSize: 500 }}` OR `{ success : false, error: '...' }`


# Price
We assume that an average request time is 10 seconds, we use the best virtual machine to get the result fast enough thus it is 2GB RAM and 2.8GHz CPU, and an average SVG file is 100Kb (usually it is even less) thus a bandwidth for a request is 0.3Mb

$32 per 100,000 requests per month
![photo](https://i.imgur.com/A43XVLY.png)
$362 per 1,000,000 requests per month
![photo](https://i.imgur.com/Lss6WpU.png)

