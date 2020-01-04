const rp = require('request-promise');
const functions = require("firebase-functions");
const puppeteer = require('svg-autocrop/node_modules/convert-svg-core/node_modules/puppeteer');
const l = puppeteer.launch;
puppeteer.launch = async function() {
    if (process.env.LOCAL) {
        console.info('Running a normal puppeteer');
        return await l.apply(this, arguments);
    } else {
        console.info('Running a special version of puppeteer with chrome adapted to /tmp');
        const chromium = require('chrome-aws-lambda');
        const browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });
        return browser;
    }
}
const autoCropSvg = require('svg-autocrop');

const options = {
  timeoutSeconds: 30
};

exports.autocrop = functions
  .runWith(options)
    .https.onRequest(async function(req, res) {
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
                res.json({ success: false, error: `failed to fetch an svg from ${url}`});
                return;
            }
        } else {
            svg = req.body.svg;
        }
        if (!svg) {
            res.json({success: false, error: 'The "svg" parameter with an svg file content should be present'});
            return;
        }
        try {
            const output = await autoCropSvg(svg , {title: req.body.title});
            res.json({success: true, result: output.result, skipRiskyTransformations: output.skipRiskyTransformations});
        } catch (ex) {
            res.json({success: false, error: `svg autocrop failed: ${ex.message || ex}`});
            return;
        }
    });
