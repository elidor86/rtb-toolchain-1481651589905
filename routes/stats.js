var express = require('express');
var router = express.Router();

var elasticsearch = require('../lib/elasticsearch');

router.get('/agent', function (req, res) {
    return res.json(elasticsearch.keepaliveAgent.getCurrentStatus());
});

module.exports = router;
