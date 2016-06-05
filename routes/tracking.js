var express = require('express');
var router = express.Router();

var postback = require('../lib/postback');
var tracking = require('../lib/tracking');

router.get('/', tracking.bidTracking);
router.get('/postback/mb', postback.handle);

module.exports = router;
