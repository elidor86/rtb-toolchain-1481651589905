var Elasticsearch = require('./elasticsearch');
var Postback = {};


Postback.handle = function (req, res) {

    res.end("ok");

    var data = req.query;

    var BId = data.bid;
    var rate = data.rate || 0;


    if (!BId || BId.length == 0) {
        return;
    }


    Elasticsearch.client.updateByQuery({
        index: 'bids',
        type: 'BIDs_Won',
        body: {
            // put the partial document under the `doc` key
            "query": {
                "term": {
                    "BID_ID": BId
                }
            },
            "script": {
                "inline": "ctx._source.rate=" + rate + "; ctx._source.converted=true"
            }
        }
    }, function (error, response) {

        console.trace(" response ", response);
        if (error) {
            console.trace(" Postback.handle error ", error);
            console.trace(" response ", response);
        }

    })

};

module.exports = Postback;