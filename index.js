const functions = require("firebase-functions");
const autoCropSvg = require('svg-autocrop');

const options = {
  timeoutSeconds: 30
};

exports.autocrop = functions
  .runWith(options)
    .https.onRequest(async function(req, res) {
        if (req.get('content-type') !== 'application/json' || req.method !== 'POST') {
            res.json({success: false, error: 'We expect a POST request with application/json content-type'});
            return;
        }
        if (!req.body.svg) {
            res.json({success: false, error: 'The "svg" parameter with an svg file content should be present'});
            return;
        }
        try {
            const output = await autoCropSvg(req.body.svg);
            res.json({success: true, result: output.result, skipRiskyTransformations: output.skipRiskyTransformations});
        } catch (ex) {
            res.json({success: false, error: `svg autocrop failed: ${ex.message || ex}`});
            return;
        }
    });
