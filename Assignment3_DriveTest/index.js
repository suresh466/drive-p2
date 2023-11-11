const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

const User = require('./models/user');
const {validateG2Middleware, validateGMiddleware} = require('./middleware/validateMiddlewares')
const { checkLoggedIn, checkDriver, addIsLoggedInToLocals } = require('./middleware/authMiddleware');


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
app.use(addIsLoggedInToLocals);

app.listen(3000, ()=>{
    console.log('app listening on port 3000');
});

app.get('/', (req, res) => {
    res.render('dashboard', {page: 'home'});
});

app.get('/g', checkDriver, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user.licenseNo === 'default') {
            // Redirect to G2 page if license number is default
            res.redirect('/g2');
        } else {
            // Show G page with pre-filled data
            res.render('g', { page: 'g_test', user: user });
        }
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});


app.get('/g2', checkDriver, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user.licenseNo === 'default') {
            // Show G2 page with empty boxes for first-time user
            res.render('g2', { page: 'g2_test', user: user, errors: {}, isNewUser: true });
        } else {
            // Show G2 page with pre-filled data for existing user
            res.render('g2', { page: 'g2_test', user: user, errors: {}, isNewUser: false });
        }
    } catch (err) {
        res.status(500).send('Error: ' + err.message);
    }
});


app.get('/dashboard', checkLoggedIn, (req, res) => {
    res.render('dashboard', {page: 'dashboard'});
});

app.get('/login', (req, res) => {
    res.render('login', {page: 'login/signup'});
});

app.post('/submit-g2', validateG2Middleware, async (req, res) => {
    try {
        const userId = req.session.userId;
        const updatedData = {
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
        };

        await User.findByIdAndUpdate(userId, updatedData, { new: true });

        res.redirect('/g');
    } catch (err) {
        res.status(500).send('Error updating user: ' + err.message);
    }
});


app.post('/update-g', validateGMiddleware, async (req, res) => {
    try {
        const userId = req.session.userId;  // Use session user ID
        await User.updateOne({ _id: userId }, {
            "car_details.make": req.body.make,
            "car_details.model": req.body.model,
            "car_details.year": req.body.year,
            "car_details.platno": req.body.plateNumber
        });

        res.redirect('/g');  // Redirect to G page after update
    } catch (err) {
        res.status(500).send('Error updating car details: ' + err.message);
    }
});


app.post('/signup', async (req, res) => {
    try {
        if (req.body.password === req.body.repeat_password) {
            const user = new User({ ...req.body});
            await user.save();
            res.render('login', {page: 'login/signup', message: 'User created. Proceed to login!' });
        }
        else {
            res.render('login', {page: 'login/signup', message: 'Unmatching Password' });
        }
    } catch (err) {
        res.status(500).send('Error during signup: ' + err.message);
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
        res.status(500).send('Error during login: ' + err.message)
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.redirect('/dashboard');
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});
