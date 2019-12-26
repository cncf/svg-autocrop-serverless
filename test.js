const rp = require('request-promise');
async function main() {
    let baseUrl = process.env.URL;
    if (!baseUrl) {
        baseUrl = `http://localhost:8080`;
        console.info(`URL not set, using ${baseUrl}. you can use URL=remote npm run test to check on a cloud`);
    }
    if (baseUrl === 'remote') {
        baseUrl = `https://us-central1-cncf-svg-autocrop.cloudfunctions.net/autocrop`;
        console.info(`Testing remote URL: ${baseUrl}`);
    }

    // Check an empty request
    {
        const response1 = await rp({
            uri: baseUrl,
            json: true
        });

        if (JSON.stringify(response1) !== JSON.stringify({
            success: false,
            error:  'We expect a POST request with application/json content-type'
        })) {
            console.info(`Wrong response for an incorrect request`, response1);
            process.exit(1);
        } else {
            console.info('Get request ok');
        }
    }


    {
        const response2 = await rp({
            method: 'POST',
            body: {"svg": ""},
            uri: baseUrl,
            json: true
        });

        if (JSON.stringify(response2) !== JSON.stringify({
            success: false,
            error:  'The "svg" parameter with an svg file content should be present'
        })) {
            console.info(`Wrong response for an incorrect request`, response2);
            process.exit(1);
        } else {
            console.info('Empty svg input ok');
        }
    }

    {
        const input = require('fs').readFileSync(`node_modules/svg-autocrop/fixtures/f5.input.svg`, 'utf-8');
        const output = require('fs').readFileSync(`node_modules/svg-autocrop/fixtures/f5.output.svg`, 'utf-8');
        const response3 = await rp({
            method: 'POST',
            body: {"svg": input, title: "f5.input.svg logo"},
            uri: baseUrl,
            json: true
        });

        if (JSON.stringify(response3) !== JSON.stringify({
            success: true,
            result: output,
            skipRiskyTransformations: false
        })) {
            console.info(`Wrong response for an proper request`, '\n', response3.result, '\n', output);
            process.exit(1);
        } else {
            console.info('F5 logo test ok');
        }

    }



    process.exit(0);


}
main();
