var express = require('express');
var Bidder = require('../lib/bidder');
var redirect = require('../lib/redirect');
var router = express.Router();

/* GET home page. */
router.get('/redirect/:id', redirect.redirect);
router.get('/ch/:id', Bidder.bidder);

router.get('/env', function (req, res) {
    return res.json(process.env);
});


router.get('/', function (req, res) {
    return res.send("hello");
});

module.exports = router;
