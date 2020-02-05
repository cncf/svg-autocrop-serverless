const Promise = require('bluebird');
const rp = require('request-promise');
const functions = require("firebase-functions");


const options = {
  timeoutSeconds: 30
};

// this allows us to run an svg autocrop in a separate process so we are not
// blocked by long time SVGO transformations and can return a timeout exactly at 20s
function runInProcess(options) {
    const fork = require('child_process').fork;
    const program = fork('./background');
    return new Promise(function(resolve, reject) {
        program.on('message', function(msg) {
            if (msg.type === 'error') {
                program.kill();
                console.info(msg);
                reject(msg.error);
            } else {
                program.kill();
                resolve(msg.output);
            }
        });
        program.send(options);
    });
}

const getLocation = async function(ip) {
    try {
        console.info(ip);
        const location = JSON.parse(await rp(`https://ipinfo.io/${ip}`));
        console.info(location);
        return `${location.country} / ${location.region} / ${location.city}`;
    } catch (ex) {
        return `Unknown location`;
    }
}

const reportToSlack = async function({ip, success, error}) {
    const location = await getLocation(ip);
    console.info({location});
    const slackChannel = process.env.SLACK_CHANNEL;
    if (!slackChannel) {
        return
    }
    const url = `https://hooks.slack.com/services/${slackChannel}`;
    console.info(`reporting to slack ${url}`);
    try {
        const result = await rp({
            method: 'POST',
            url: url,
            json: {
                text: success ? `Someone from ${location} transformed an svg file. ` : `Someone from ${location} failed to transform an svg file! ${error}`
            }
        })
        console.info(result);
    } catch(ex) {
        console.info("Failed to report to slack, but not a problem");
    }
}

exports.autocrop = functions
  .runWith(options)
    .https.onRequest(async function(req, res) {
        console.info(req.headers);
        console.info('real: ', (req.headers['x-forwarded-for'] || '').split(', ')[0]);
        var ip = (req.headers['x-forwarded-for'] || '').split(', ')[0] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.connection.socket.remoteAddress
        console.info(ip);

        if (req.method === 'GET') {
            res.end(require('fs').readFileSync('index.html', 'utf-8'));
            return;
        }
        if (req.get('content-type') !== 'application/json' || req.method !== 'POST') {
            res.json({success: false, error: 'We expect a POST request with application/json content-type'});
            return;
        }
        let svg;
        if (req.body.url) {
            try {
                svg = await rp({
                    url: req.body.url
                });
            } catch(ex) {
                await reportToSlack({ip, success: false, error: `failed to fetch an svg from ${req.body.url}`});
                res.json({ success: false, error: `failed to fetch an svg from ${req.body.url}`});
                return;
            }
        } else {
            svg = req.body.svg;
        }
        if (!svg) {
            await reportToSlack({ip, success: false, error: `The "svg" parameter with an svg file content should be present`});
            res.json({success: false, error: 'The "svg" parameter with an svg file content should be present'});
            return;
        }
        if (svg.length > 1.5 * 1024 * 1024) {
            await reportToSlack({ip, success: false, error: `Maximum file size is 1.5 MB.`});
            res.json({success: false, error: `Maximum file size is 1.5MB`});
            return;
        }
        try {
            const output = await (Promise.resolve(runInProcess({svg: svg, title: req.body.title})).timeout(20 * 1000, 'Failed to autocrop within 20 seconds'));
            const getLength = (s) => Buffer.byteLength(s, 'utf8');
            const originalSize = getLength(svg);
            const transformedSize = getLength(output.result);
            await reportToSlack({ip, success: true});
            res.json({success: true, result: output.result, skipRiskyTransformations: output.skipRiskyTransformations, stats: { originalSize, transformedSize }});
        } catch (ex) {
            await reportToSlack({ip, success: false, error: ex.message || ex});
            res.json({success: false, error: `svg autocrop failed: ${ex.message || ex}`});
            return;
        }
    });
