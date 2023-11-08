const express = require('express');
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');
const User = require('./models/user');
const {validateG2Middleware, validateGMiddleware} = require('./middleware/validateMiddlewares')


const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const connectionstring = 'mongodb+srv://sthagunna6660:passwordfs@cluster0.gyvacsu.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(connectionstring, {usenewurlparser:true})
mongoose.connection.once('open', () => {
    console.log('connected to mongodb!');
});

app.listen(3000, ()=>{
    console.log('app listening on port 3000');
});

app.get('/', (req, res) => {
    res.render('dashboard', {page: 'dashboard'});
});

app.get('/g', (req, res) => {
    res.render('g', {page: 'g_test'})
});

app.get('/g2', (req, res) => {
    res.render('g2', {page: 'g2_test'})
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', {page: 'dashboard'});
});

app.get('/login', (req, res) => {
    res.render('login', {page: 'login'});
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
