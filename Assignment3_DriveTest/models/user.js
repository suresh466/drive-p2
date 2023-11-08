const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    age: Number,
    licenseNo: String,
    car_details: {
        make: String,
        model: String,
        year: Number,
        platno: String
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
