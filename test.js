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

        if (response1 !== require('fs').readFileSync('./index.html', 'utf-8')) {
            console.info(`An index.html should be returned on GET request`, response1);
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
            skipRiskyTransformations: false,
            stats: {
                originalSize: input.length,
                transformedSize: output.length
            },
        })) {
            console.info(`Wrong response for an proper request`, '\n', response3, '\n', output);
            process.exit(1);
        } else {
            console.info('F5 logo test ok');
        }

    }

    {
        const input = 'https://raw.githubusercontent.com/cncf/svg-autocrop/master/fixtures/agile-stacks.input.svg';
        const inputFile = await rp({
            uri: input
        });
        const output = require('fs').readFileSync(`node_modules/svg-autocrop/fixtures/agile-stacks.output.svg`, 'utf-8');
        const response4 = await rp({
            method: 'POST',
            body: {"url": input, title: "agile-stacks.input.svg logo"},
            uri: baseUrl,
            json: true
        });

        if (JSON.stringify(response4) !== JSON.stringify({
            success: true,
            result: output,
            skipRiskyTransformations: false,
            stats: {
                originalSize: inputFile.length + 1,
                transformedSize: output.length
            }
        })) {
            console.info(`Wrong response for a proper request with url`, '\n', response4.result, '\n', output);
            process.exit(1);
        } else {
            console.info('url fetching on agile-stacks logo ok');
        }

    }



    process.exit(0);


}
main().catch( function(ex) {
  console.info(ex.message);
  process.exit(1);
});
