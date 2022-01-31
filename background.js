const autoCropSvg = require('svg-autocrop');
process.on('message', async function(msg) {
    try {
        console.info(msg.svg, msg.title, msg.caption, msg.captionWidth);
        const output = await autoCropSvg(msg.svg , {title: msg.title, caption: msg.caption, captionWidth: msg.captionWidth}); //.timeout(20 * 1000, 'Failed to autocrop within 20 seconds'));
        process.send({type: 'done', output: output });
    } catch(ex) {
        console.info(ex);
        process.send({type: 'error', error: ex.message || ex});
    }
});

