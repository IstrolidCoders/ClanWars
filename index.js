var express = require('express');
var {IstrolidClient} = require('./IstrolidClient.js');
var pg = require('pg');

const PORT = process.env.PORT || 8080;

var db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
db.connect().then(() => console.log("db connected"));

var app = express();
var istroClients = [];
var globalServer = new IstrolidClient();

app.get('/istrolid', (req, res) => {
    db.query('SELECT * from BattleRecords;', (err, res) => {
        if(err) throw err;
        let r = "";
        for(let row of res.rows) {
            r += JSON.stringify(row) + "<br/>";
        }
        res.send(r);
    });
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
        client.on('gameended', e => {
            db.query('INSERT INTO BattleRecords (server, type, players, win) VALUES ($1, $2, $3::json[], $4);',
                [client.serverName, client.serverType, e.players.map(p => JSON.stringify(p)), e.win],
                (err, res) => {
                    if(err) throw err;
                });
        });

        client.connect();
        istroClients.push(client);
    }
});

globalServer.connect();
