var express = require('express')
var app = express()

const request = require('request');
const config = require('./config');

const PocketApi = require('./modules/PocketApi');
const DribbbleApi = require('./modules/DribbbleClient');

app.set('views engine', 'pug');
app.set('views', './resources/views');

const api = new PocketApi(config, request);
const dribbble = new DribbbleApi(config, request);

app.get('/', function (req, res) {
    const dribbbleUrl = dribbble.getRequestPermissionUrl();

    api.requestPermission().then(({url,code}) => {
        res.render('index.pug', {authUrl: url, dribbbleUrl: dribbbleUrl})
    });
});

app.get('/auth', (req, res) => {
    const token = api.getAccessCode();

    api.getPocketAccessToken(token).then(({username, accessCode}) => {
        res.render('connected.pug', {username})
    });
});

app.get('/dribbble/auth', (req, res) => {
    console.log(req.query.code);
    console.log(req.query.state);

    res.redirect('/')
});

app.get('/list', (req, res) => {
    api.getItems().then(data => {
        res.render('list.pug', {items: data.list})
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
