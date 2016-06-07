var elasticsearch = require('elasticsearch');
request = require('request');

var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(600, 'second');

var http = require('http');
var Agent = require('agentkeepalive');

var keepaliveAgent = new Agent({
    maxSockets: 5000,
    maxFreeSockets: 1000,
    timeout: 2000,
    keepAliveTimeout: 30000 // free socket keepalive for 30 seconds
});


var BidsToFlash = 2000;
//var BidsToFlash = 0;

if (process.env.DEV == 'true') {
    var esUrl = '104.196.118.159';
    var options = {
        host: '104.196.118.159:9200'
    };
}

options = {
    host: '104.197.219.132:9200'
};

esUrl = '104.197.219.132';



options.maxSockets = 4000;
options.minSockets = 100;

var client = new elasticsearch.Client(options);

var esJobClient = new elasticsearch.Client({
    host: '104.154.60.227:9200',
    maxSockets: 5000,
    minSockets: 1000
});

/*
 client.create({
 index: 'rtb',
 type: 'campaigns',
 ttl: "1s",
 body: {
 "Channel_ID": 2,
 "Campaign_ID": 231,
 "Campaign_Name": "InboxDollars-mb",
 "BID_Value": 0.008,
 "Redirect_URL": "http://www.mb104.com/lnk.asp?o=6365&c=918271&a=191204",
 "Max_Num_Of_BIDs": 1000,
 "Bid_URL": "http://rtb.dans-leads.com/tracking?Campaign_ID=@@Campaign_ID@@&BID_ID=@@BID_ID@@",
 "Filter_GEO": "(us)",
 "Filter_URLs": "()",
 "Filter_KeyWords": "()",
 "Filter_Function": "jobsPredict",
 "Num_Of_BIDs_Sent": 1002,
 "Num_Of_BIDS_Won": 57,
 "counter": ""
 }
 }, function (error, response) {

 console.log("error ", error);
 console.log("response ", response);
 });*/


var Elasticsearch = {};

Elasticsearch.keepaliveAgent = keepaliveAgent;

Elasticsearch.client = client;

Elasticsearch.logBid = function (data) {

    //return;
    return new Promise(function (fulfill, reject) {

        client.create({
            index: 'bids',
            type: 'BIDs_Sent',
            body: data
        }, function (error, response) {

            fulfill();
            // console.log("error ",error);
            // console.log("response ",response);
        });
    });
};

Elasticsearch.logEmail = function (data) {

    //return;
    return new Promise(function (fulfill, reject) {

        client.create({
            index: 'bids',
            type: 'emails',
            body: data
        }, function (error, response) {

            fulfill();
            // console.log("error ",error);
            // console.log("response ",response);
        });
    });

};

var noNids = [];

Elasticsearch.logNoBid = function (data) {

    //return;

    noNids.push(data);
    //console.log("noNids", noNids.length);

    var flashToElastic = function (jobsToFlash) {
        var ops = [];

        for (var i = 0; i < jobsToFlash.length; i++) {

            var job = jobsToFlash[i];

            var operation = {
                create: {_index: 'bids', _type: 'BIDs'}
            };

            ops.push(operation);
            ops.push(job);
        }

        client.bulk({
            body: ops
        }).then(function (resp) {
            // noop

        }, function (rejection) {
            console.log(('>>> ' + (new Date()).toUTCString()));
            console.log('' + JSON.stringify(rejection));
            console.log('<<<');
        });


    };

    if (noNids.length >= BidsToFlash) {
        flashToElastic(noNids.splice(0, BidsToFlash));
    }


};

Elasticsearch.incCountersForBidSent = function (data) {

    return new Promise(function (fulfill, reject) {

        client.bulk({
            body: [

                {update: {_index: 'rtb', _type: 'campaigns', _id: data.campaignId, '_retry_on_conflict': 500}},
                {script: 'ctx._source.Num_Of_BIDs_Sent += 1', upsert: {counter: 1}},

                {update: {_index: 'rtb', _type: 'dailyStat', _id: data.date, '_retry_on_conflict': 500}},
                {script: 'ctx._source.counter += 1', upsert: {counter: 1}}
            ]
        }, function (err, resp) {
            if (err || !resp || resp.errors == true) {
                console.trace("incCountersForBidSent err", err);
                console.trace("incCountersForBidSent resp", JSON.stringify(resp));
                return reject();
            }
            fulfill();
        });
    });

};

Elasticsearch.incCountersForBidWon = function (data) {

    return new Promise(function (fulfill, reject) {

        client.bulk({
            body: [

                {update: {_index: 'rtb', _type: 'campaigns', _id: data.Cmp_Es_ID}},
                {script: 'ctx._source.Num_Of_BIDS_Won += 1', upsert: {counter: 1}, retryOnConflict: 10}

            ]
        }, function (err, resp) {
            if (err || !resp || resp.errors == true) {
                console.trace("incCountersForBidSent err", err);
                console.trace("incCountersForBidSent resp", JSON.stringify(resp));
                return reject();
            }
            fulfill();
        });
    });

};

Elasticsearch.getDailyNumOfBid = function (data) {

    //console.log('getDailyNumOfBid data',data);
    return new Promise(function (fulfill, reject) {

        Elasticsearch.client.get({
            index: 'rtb',
            type: 'dailyStat',
            id: data
        }).then(function (resp) {

            var count = resp._source.counter;
            fulfill(count);


        }, function (err) {

            if (err && err.displayName == 'NotFound') {
                fulfill(0);
            } else {
                console.trace("displayName ", err);
                reject(err);
            }

        });
    });

};

Elasticsearch.getBidData = function (bidId) {

    //console.log('getBidData bidId', bidId);
    return new Promise(function (fulfill, reject) {

        Elasticsearch.client.search({
            index: 'bids',
            type: 'BIDs_Sent',
            body: {
                "query": {
                    "constant_score": {
                        "filter": {
                            "term": {
                                "BID_ID": bidId
                            }
                        }
                    }
                }
            }
        }).then(function (resp) {


            var bidData = resp.hits.hits[0]._source;
            //console.log('getBidData bidData', bidData);
            fulfill(bidData);


        }, function (err) {

            console.log('getBidData err', err);

            reject(err);

        });
    });

};


Elasticsearch.getBuyingList = function (name) {

    //console.log('getBuyingList name', name);
    return new Promise(function (fulfill, reject) {

        Elasticsearch.client.search({
            index: 'bidding',
            type: name,
            body: {size: 2000}
        }).then(function (resp) {


            var data = resp.hits.hits;
            //console.log('getBuyingList data', data);
            var list = [];
            data.forEach(function (item) {
                list.push(item._source.ip);
            });
            // console.log('getBuyingList list', list);
            fulfill(list);


        }, function (err) {

            console.log('getBidData err', err);

            reject(err);

        });
    });

};


Elasticsearch.fetchEs = function (post_data, ip, path, cb) {


    post_data = JSON.stringify(post_data);
    var options = {
        host: ip || esUrl,
        port: 9200,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(post_data)
        },
        agent: keepaliveAgent
    };


    var req = http.request(options, function (res) {

        if (res.statusCode != 200) {

            global.logger.debug('res.statusCode  err', res.statusCode);
            return cb({e: "statusCode " + res.statusCode}, null);
        }

        res.setEncoding('utf8');

        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
            //global.logger.debug('body ', body);
        });

        res.on('end', function () {


            try {
                var resp = JSON.parse(body);
            } catch (e) {
                return cb(e, null);
            }

            //global.logger.debug('resp ', resp);
            return cb(null, resp);
        });
    });

    req.on('error', function (e) {
        return cb(e, null);
    });

    req.write(post_data);

    req.end();

};

Elasticsearch.getAllCmp = function () {

    var self = this;
    return new Promise(function (fulfill, reject) {

        var body = {
            "size": 1000,
            "query": {
                "filtered": {
                    "filter": {
                        "script": {
                            "script": "doc[\"Num_Of_BIDs_Sent\"].value < doc[\"Max_Num_Of_BIDs\"].value"
                        }
                    },
                    "query": {
                        "match_all": {}
                    }
                }
            }
        };

        var start = new Date().getTime();
        self.fetchEs(body, null, '/rtb/campaigns/_search', function (err, resp) {
            var end = new Date().getTime();
            var diff = end - start;
            // console.log("time to get camp network ", JSON.stringify(resp));
            global.logger.debug('getAllCmp err', err);
            if (err) {
                console.log("fetchEs ee ", err);
                return fulfill({campaigns: [], took: 0, tookIncludeNetwork: 0});
            }


            try {
                var hits = resp.hits.hits;
                var campaigns = [];


                hits.forEach(function (item) {
                    // console.log("item ", item);
                    item._source._id = item._id;
                    campaigns.push(item._source);
                });


                //console.log("campaigns ", campaigns.length);
                //console.log("took ", resp.took);

                fulfill({campaigns: campaigns, took: resp.took, tookIncludeNetwork: diff});
            } catch (e) {
                console.log("fetchEs e ", e);
                fulfill({campaigns: [], took: 0, tookIncludeNetwork: 0});
            }


        });
    });


};

Elasticsearch.getJobUrl = function (data) {

    var self = this;

    global.logger.debug('getJobUrl data ', data);
    return new Promise(function (fulfill, reject) {


        var should = [];

        should.push({"match_phrase": {"title": {"query": data.q, "boost": 5, "slop": 5}}});
        should.push({"common": {"title.english": {"cutoff_frequency": 0.001, "boost": 1000, "query": data.q}}});

        var query = {
            "bool": {
                "must": {
                    "bool": {
                        "should": should
                    }
                }
            }
        };


        var body = {
            "size": 1,
            "sort": {"ranking": {"order": "asc"}},
            "query": {
                "filtered": {
                    "query": query,
                    "filter": {
                        "geo_distance": {
                            "distance": 10 + "km",
                            "latlon": {
                                "lat": data.lat,
                                "lon": data.lon
                            }
                        }
                    }
                }
            }
        };

        //console.log("body ", JSON.stringify(body));


        esJobClient.search({
            index: 'jobs',
            body: body
        }).then(function (resp) {


            try {
                var hits = resp.hits.hits;

                if (hits[0] && hits[0]._source) {
                    var jobUrl = hits[0]._source.url;
                    global.logger.debug('hits[0]._source ', hits[0]._source);
                    fulfill(jobUrl);
                } else {
                    fulfill();
                }


                // global.logger.debug('jobUrl ', jobUrl);
                //console.log("jobUrl ", jobUrl);
                //console.log("took ", resp.took);


            } catch (e) {
                console.trace("getJobUrl e ", e);
                reject(e);
            }


        }, function (err) {

            console.trace("fetchEs ee ", err);
            return reject();

        });

    });


};


module.exports = Elasticsearch;