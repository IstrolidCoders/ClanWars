var express = require('express');
var {IstrolidClient} = require('./IstrolidClient.js');
var pg = require('pg');

const PORT = process.env.PORT || 8080;
global.DEBUG = process.env.DEBUG;

var db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
db.connect().then(() => console.log("db connected"));

var app = express();
var istroClient = new IstrolidClient();

app.get('/istrolid', (req, res) => {
    db.query('SELECT * from BattleRecords;', (err, qres) => {
        if(err) throw err;
        res.json(qres.rows);
    });
});

app.get('/', (req, res) => {
    res.sendFile(req.path, {root: 'html'});
});

var server = app.listen(PORT, function () {
    console.log("Listening on port", server.address().port);
});

istroClient.on('gameended', e => {
    if(global.DEBUG)
        console.log("Game ended", [e.server, e.type, e.players.map(p => JSON.stringify(p)), e.win]);
    db.query('INSERT INTO BattleRecords (server, type, players, win) VALUES ($1, $2, $3::json[], $4);',
        [e.server, e.type, e.players.map(p => JSON.stringify(p)), e.win],
        (err, res) => {
            if(err) throw err;
        });
});
istroClient.connect();
