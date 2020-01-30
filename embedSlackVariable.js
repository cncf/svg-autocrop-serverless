const content = require('fs').readFileSync('index.js', 'utf-8');
const newContent = content.replace('process.env.SLACK_CHANNEL', "'" + process.env.SLACK_CHANNEL + "'");
require('fs').writeFileSync('index.js', newContent);
