let express = require('express')
let app = express()
const port = 3000;

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
        res.redirect('/')
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
        res.render('project/index', {projects: data});
    });
});

app.get('/projects/:tag', (req, res) => {
    const tag = req.params.tag;

    api.getItems(tag).then(shots => {
        res.render('project/view', {shots: shots});
    });
});

app.listen(port, _ => {
    console.log(`Example app listening on port ${port}!`)
})
