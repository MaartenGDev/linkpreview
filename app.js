var express = require('express')
var app = express()

const request = require('request');
const config = require('./config');

const PocketApi = require('./modules/PocketApi');

app.set('views engine', 'pug');
app.set('views', './resources/views');

const api = new PocketApi(config, request);

app.get('/', function (req, res) {
    api.requestPermission().then((url) => {
        res.render('index.pug', {authUrl: url})
    });
});

app.get('/auth', (req, res) => {
    res.render('connected.pug')
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
