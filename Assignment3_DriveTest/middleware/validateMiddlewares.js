const User = require('../models/user');

const validateG2Middleware = (req, res, next) => {
    let errors = {};

    if (!req.body.firstName || req.body.firstName.trim() === '') errors.firstName = 'First name is required.';
    if (!req.body.lastName || req.body.lastName.trim() === '') errors.lastName = 'Last name is required.';
    if (!req.body.age || isNaN(req.body.age)) errors.age = 'Age is required and must be a number.';
    if (!req.body.licenseNumber || req.body.licenseNumber.trim() === '' || !/[A-Za-z0-9]{8}/.test(req.body.licenseNumber)) errors.licenseNumber = 'Valid license number is required.';
    if (!req.body.make || req.body.make.trim() === '') errors.make = 'Car make is required.';
    if (!req.body.model || req.body.model.trim() === '') errors.model = 'Car model is required.';
    if (!req.body.year || isNaN(req.body.year)) errors.year = 'Car year is required and must be a number.';
    if (!req.body.plateNumber || req.body.plateNumber.trim() === '') errors.plateNumber = 'Plate number is required.';

    if (Object.keys(errors).length > 0) {
        return res.render('g2', { errors, formData: req.body, page: 'g2_test'});
    }

    next();
};

const validateGMiddleware = async (req, res, next) => {
    let errors = {};

    if (!req.body.make || req.body.make.trim() === '') errors.make = 'Car make is required.';
    if (!req.body.model || req.body.model.trim() === '') errors.model = 'Car model is required.';
    if (!req.body.year || isNaN(req.body.year)) errors.year = 'Car year is required and must be a number.';
    if (!req.body.plateNumber || req.body.plateNumber.trim() === '') errors.plateNumber = 'Plate number is required.';

    if (Object.keys(errors).length > 0) {
        try {
            const user = await User.findOne({ licenseNo: req.body.licenseNumber });
            if (!user) {
                res.render('g', {page: "g_test", message: "No User Found" });
            } else {
                res.render('g', {errors, formData: req.body, user: user, page: "g_test"});
            }
        } catch (err) {
            res.send('Error fetching user: ', err);
        }
    }

    next();
};

const validateSignup = async (req, res, next) => {
    const { username, password, repeat_password } = req.body;
    let errors = [];

    if (!username || !password || !repeat_password) errors.push('Please fill in all fields');
    if (await User.findOne({ username })) errors.push('Username is already taken');
    if (password !== repeat_password) errors.push('Repeat password does not match')

    if (errors.length > 0) {
        res.render('login', { page: 'login/signup', errors });
    } else {
        next();
    }
};

module.exports = {
    validateG2Middleware,
    validateGMiddleware,
    validateSignup
};
