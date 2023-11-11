const home = (req, res) => {
    res.render('dashboard', {page: 'home'});
};

const dashboard = (req, res) => {
    res.render('dashboard', {page: 'dashboard'});
}

module.exports = { home, dashboard }
