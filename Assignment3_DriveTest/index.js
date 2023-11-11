const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

const User = require('./models/user');
const {validateG2Middleware, validateGMiddleware} = require('./middleware/validateMiddlewares')
const checkLoggedIn = require('./middleware/authMiddleware');


const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const connectionstring = 'mongodb+srv://sthagunna6660:passwordfs@cluster0.zr72idb.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(connectionstring, {usenewurlparser:true})
mongoose.connection.once('open', () => {
    console.log('connected to mongodb!');
});

app.use(session({
    secret: 'secret-secretKey',
    resave: false,
    saveUninitialized: true
}));

app.listen(3000, ()=>{
    console.log('app listening on port 3000');
});

app.get('/', (req, res) => {
    res.render('dashboard', {page: 'home'});
});

app.get('/g', checkLoggedIn, (req, res) => {
    res.render('g', {page: 'g_test'})
});

app.get('/g2', checkLoggedIn, (req, res) => {
    res.render('g2', {page: 'g2_test'})
});

app.get('/dashboard', checkLoggedIn, (req, res) => {
    res.render('dashboard', {page: 'dashboard'});
});

app.get('/login', (req, res) => {
    res.render('login', {page: 'login/signup'});
});

app.post('/submit-g2', validateG2Middleware, async (req, res) => {
    let user = new User({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        age: req.body.age,
        licenseNo: req.body.licenseNumber,
        car_details: {
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            platno: req.body.plateNumber
        }
    });
    try {
        await user.save();
        res.redirect('/g');
    } catch (err) {
        res.send('Error saving user: ', err);
    }
});

app.post('/fetch-g', async (req, res) => {
    try {
        const user = await User.findOne({ licenseNo: req.body.licenseNumber });
        if (!user) {
            res.render('g', {page: "g_test", message: "No User Found" });
        } else {
            res.render('g', {page: "g_test", user: user });
        }
    } catch (err) {
        res.send('Error fetching user: ', err);
    }
});

app.post('/update-g/:id', validateGMiddleware, async (req, res) => {
    try {
        await User.updateOne({ _id: req.params.id }, {
            "car_details.make": req.body.make,
            "car_details.model": req.body.model,
            "car_details.year": req.body.year,
            "car_details.platno": req.body.plateNumber
        });

        try {
            const user = await User.findOne({ licenseNo: req.body.licenseNumber });
            if (!user) {
                res.render('g', {page: "g_test", message: "No User Found" });
            } else {
                res.render('g', {page: "g_test", user: user });
            }
        } catch (err) {
            res.send('Error fetching user: ', err);
        }

    } catch (err) {
        res.send('Error updating car details: ', err);
    }
});

app.post('/signup', async (req, res) => {
    try {
        if (req.body.password === req.body.repeat_password) {
            const user = new User({ ...req.body});
            await user.save();
            res.redirect('/login');
        }
        else {
            res.render('login', {page: 'login/signup', message: 'Unmatching Password' });
        }
    } catch (err) {
        res.send('Error during signup: ', err);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/dashboard');
        } else {
            res.render('login', {page: 'login/signup', message: 'Invalid credentials' });
        }
    } catch (err) {
        res.send('Error during login: ', err);
    }
});
