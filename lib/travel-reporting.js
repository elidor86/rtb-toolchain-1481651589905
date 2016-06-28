//var mongoDb = require('./mongo');
var json2csv = require('json2csv');
var fs = require('fs');
var UrlParser = require('./url-parser');
//var Aerospike = require('./aerospike');
var Elasticsearch = require('./elasticsearch');
var Travel = require('./travel');
var co = require('co');


var Reporting = {};


Reporting.getBidsWon = function () {

    return new Promise(function (fulfill, reject) {


        Elasticsearch.client.search({
            index: 'bids',
            type: 'BIDs_Won',
            body: {
                "size": 50030,
                "query": {
                    "constant_score": {
                        "filter": {
                            "term": {
                                "Campaign_ID": '288'
                            }
                        }
                    }
                }
            }
        }).then(function (resp) {


            var raws = resp.hits.hits;

            var BidsWon = [];
            raws.forEach(function (raw) {
                BidsWon.push(raw._source);
            });


            fulfill(BidsWon);


        }, function (err) {

            console.log('getBidData err', err);

            // reject(err);

        });
    });

};

Reporting.getBidsSent = function () {

    return new Promise(function (fulfill, reject) {


        var all = [];

        Elasticsearch.client.search({
            index: 'bids',
            // Set to 30 seconds because we are calling right back
            scroll: '5m',
            search_type: 'scan',
            //fields: ['*'],
            q: '_type:BIDs_Sent AND Campaign_ID:288'
        }, function getMoreUntilDone(error, response) {
            // collect the title from each response
            response.hits.hits.forEach(function (hit) {
                //console.log('every "test" title', hit._source);
                all.push(hit._source);
            });

            console.log('all.length ', all.length);

            if (response.hits.total !== all.length) {
                // now we can call scroll over and over
                Elasticsearch.client.scroll({
                    scrollId: response._scroll_id,
                    scroll: '30s'
                }, getMoreUntilDone);
            } else {
                console.log('every "test" title', all.length);
            }
        });



    });

};


Reporting.create = function () {

    var self = this;

    var fields = [];

    co(function *() {

        var bidsWon = yield self.getBidsWon();

        var firstBid = bidsWon[0];
        fields = Object.keys(firstBid);
        fields.push('cat');
        //  console.log(' fields', fields);

        for (var i = 0; i < bidsWon.length; i++) {
            var bid = bidsWon[i];
            var cat = Travel.classify(bid);
            if (cat) {
                bidsWon[i].cat = cat.cat;
            }


        }

        json2csv({data: bidsWon, fields: fields}, function (err, csv) {
            if (err) console.log(err);

            // console.log('csv ', csv);

            var csvFileName = 'bidsWon.csv';

            fs.writeFile(csvFileName, csv, function (err) {
                if (err) throw err;
                console.log('file saved');


            });


        });

    }).catch(function (err) {
        console.trace("err", err);
        return self.cb(null, null);
    });
};


//Reporting.getBidsSent();


