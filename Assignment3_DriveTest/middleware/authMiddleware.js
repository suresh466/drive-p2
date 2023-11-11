const User = require('../models/user');
function checkLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

async function checkDriver(req, res, next) {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (!user) {
                res.redirect('/login');
            } else if (user.userType === 'Driver') {
                next();
            } else {
                res.render('dashboard',
                    {page: 'dashboard', message: 'Unauthorized to access the page'}
                );
            }
        } catch (err) {
            res.status(500).send('Server error');
        }
    } else {
        res.redirect('/login');
    }
}

function addIsLoggedInToLocals(req, res, next) {
    res.locals.isLoggedIn = req.session.userId != null;
    next();
}

module.exports = { checkLoggedIn, checkDriver, addIsLoggedInToLocals };
