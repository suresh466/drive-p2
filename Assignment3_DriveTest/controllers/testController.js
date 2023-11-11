const User = require('../models/user');

const g2 = async (req, res) => {
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
}

const submitG2 = async (req, res) => {
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
}

const g = async (req, res) => {
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
}

const updateG = async (req, res) => {
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
}

module.exports = { g2, submitG2, g, updateG }
