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


    Elasticsearch.client.update({
        index: 'bids',
        type: 'BIDs_Won',
        id: BId,
        body: {
            // put the partial document under the `doc` key
            doc: {
                rate: rate,
                converted: true
            }
        }
    }, function (error, response) {

        // console.log("error ", error);
        // console.log("response ", response);
    })

};

module.exports = Postback;