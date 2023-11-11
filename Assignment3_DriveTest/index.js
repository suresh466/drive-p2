const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const User = require('./models/user');

const {validateG2Middleware, validateGMiddleware} = require('./middleware/validateMiddlewares')
const { checkLoggedIn, checkDriver, addIsLoggedInToLocals } = require('./middleware/authMiddleware');

const generalController = require('./controllers/generalController');
const userController = require('./controllers/userController');
const testController = require('./controllers/testController');


const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-secretKey',
    resave: false,
    saveUninitialized: true
}));

const connectionstring = 'mongodb+srv://sthagunna6660:passwordfs@cluster0.zr72idb.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(connectionstring, {usenewurlparser:true})
mongoose.connection.once('open', () => {
    console.log('connected to mongodb!');
});

app.use(addIsLoggedInToLocals);

app.listen(3000, ()=>{
    console.log('app listening on port 3000');
});

app.get('/', generalController.home);
app.get('/dashboard', checkLoggedIn, generalController.dashboard);

app.get('/login', userController.renderLogin);
app.post('/login', userController.login);
app.post('/signup', userController.signup);
app.get('/logout', userController.logout);

app.get('/g2', checkDriver, testController.g2);
app.post('/submit-g2', validateG2Middleware, testController.submitG2);
app.get('/g', checkDriver, testController.g);
app.post('/update-g', validateGMiddleware, testController.updateG);
