var memcached = require('./memcached');

var redirect = {};

redirect.redirect = function (req, res) {
    var id = req.params.id;

    memcached.getRedirect({id: id}).then(function (url) {
        res.redirect(url);
    });

};

module.exports = redirect;