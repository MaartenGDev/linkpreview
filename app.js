var express = require('express')
var app = express()

const request = require('request');
const config = require('./config');

const PocketApi = require('./modules/PocketApi');
const DribbbleApi = require('./modules/DribbbleClient');
const exphbs  = require('express-handlebars');


app.engine('.hbs', exphbs({defaultLayout: 'main', layoutsDir: 'resources/views/layouts/', extname: '.hbs'}));
app.set('views', 'resources/views/');
app.set('view engine', '.hbs');

app.use(express.static('public'))

const dribbble = new DribbbleApi(config, request);
const api = new PocketApi(config, request, dribbble);

app.get('/', (req, res) => {
    const dribbbleUrl = dribbble.getRequestPermissionUrl();

    api.requestPermission().then(({url}) => {
        res.render('login/create', {pocketUrl: url, dribbbleUrl: dribbbleUrl})
    });
});

app.get('/hbs', (req, res) => {
    res.render('home');
});

app.get('/auth', (req, res) => {
    const token = api.getAccessCode();

    api.getPocketAccessToken(token).then(({username, accessCode}) => {
        res.render('login/create', {username})
    });
});

app.get('/dribbble/auth', (req, res) => {
    const {code, state} = req.query;
    const stateSecret = config.dribbble.state_secret;

    if (stateSecret === state) {
        res.redirect('/')
    }

    dribbble.createAccessToken(code).then(({success}) => res.redirect('/'))
});

app.get('/list', (req, res) => {

    api.getItems().then(results => {
        res.render('list.pug', {items: results})
    });
});

app.get('/projects', (req, res) => {
    api.getProjects().then(data => {
        res.render('projects', {projects: data});
    });
});

app.get('/projects/:tag', (req, res) => {
    const tag = req.params.tag;

    api.getItems(tag).then(results => {
        res.render('list.pug', {items: results});
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
