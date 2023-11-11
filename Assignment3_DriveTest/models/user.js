const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstname: { type: String, default: 'default' },
    lastname: { type: String, default: 'default' },
    age: { type: Number, default: 0 },
    // licenseNo not encrypted because bcrypt doesn't support decrypting
    // and we need to decrypt it to display it on page
    licenseNo: { type: String, default: 'default' },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['Driver', 'Examiner', 'Admin'], default: 'Driver' },
    car_details: {
        make: { type: String, default: 'default' },
        model: { type: String, default: 'default' },
        year: { type: Number, default: 0 },
        platno: { type: String, default: 'default' }
    }
});

// password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
