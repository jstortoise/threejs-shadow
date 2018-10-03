let express = require('express');
const http = require('http');
const command = require('./command');

let app = express();
let server = http.createServer(app);

app.get('/merge', (request, response)=> {
    command('./hookServer/merge.sh');
    response.send('OK');
});

app.get('/push', (request, response)=> {
    command('./hookServer/push.sh');
    response.send('OK');
});

server.listen(8019);
console.log('Hook server is started');
