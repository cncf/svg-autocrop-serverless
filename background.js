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

process.on('message', async function(msg) {
    try {
        const output = await autoCropSvg(msg.svg , {title: msg.title}); //.timeout(20 * 1000, 'Failed to autocrop within 20 seconds'));
        process.send({type: 'done', output: output });
    } catch(ex) {
        console.info(ex);
        process.send({type: 'error', message: ex.message});
    }
});

