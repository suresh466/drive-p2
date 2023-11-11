const bcrypt = require('bcrypt')
const User = require('../models/user');

const renderLogin = (req, res) => {
    res.render('login', {page: 'login/signup'});
}

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/dashboard');
        } else {
            res.render('login', {page: 'login/signup', errors: [] });
        }
    } catch (err) {
        res.status(500).send('Error during login: ' + err.message)
    }
}

const signup = async (req, res) => {
    try {
        const user = new User({ ...req.body});
        await user.save();
        res.render('login', {page: 'login/signup', errors: [] });
        }
    catch (err) {
        res.status(500).send('Error during signup: ' + err.message);
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.redirect('/dashboard');
        }

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
}

module.exports = { renderLogin, login, signup, logout }
