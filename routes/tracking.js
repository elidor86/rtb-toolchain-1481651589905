var express = require('express');
var router = express.Router();

var tracking = require('../lib/tracking');

router.get('/', tracking.bidTracking);

module.exports = router;
