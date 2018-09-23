var express = require('express');
var {IstrolidClient} = require('./IstrolidClient.js');

const PORT = process.env.PORT || 8080;

var app = express();

var istroClients = [];
var globalServer = new IstrolidClient();

app.get('/istrolid', (req, res) => {
    res.send(istroClients);
});

app.get('/', (req, res) => {
    res.sendFile(req.path, {root: 'html'});
});

var server = app.listen(PORT, function () {
    console.log("Listening on port", server.address().port);
});

globalServer.on('server', s => {
    if(!istroClients[s.name]) {
        let client = new IstrolidClient(s.name);
        client.connect();
        istroClients.push(client);
    }
});

globalServer.connect();
