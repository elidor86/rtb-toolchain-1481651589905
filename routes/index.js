var express = require('express');
var Bidder = require('../lib/bidder');
var router = express.Router();

/* GET home page. */
router.get('/ch/:id', Bidder.bidder);
router.get('/env', function (req, res) {
    return res.json(process.env);
});

module.exports = router;
