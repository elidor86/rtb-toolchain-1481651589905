var elasticsearch = require('elasticsearch');

var options = {
    host: '104.196.118.159:9200'
};


if (process.env.DEV == 'true') {

    options = {
        host: '104.154.60.227:9200'
    };

}


options.maxSockets = 1900;
options.minSockets = 100;


var client = new elasticsearch.Client(options);

/*
 client.create({
 index: 'rtb',
 type: 'campaigns',
 body: {
 "Channel_ID" : 2,
 "Campaign_ID" : 202,
 "Campaign_Name" : "predict100",
 "BID_Value" : 0.008,
 "Redirect_URL" : "https://target-talent.com/campaigns/jobs/suggest?ch=c202&provider=2",
 "Max_Num_Of_BIDs" : 2500,
 "Bid_URL" : "http://rtb.dans-leads.com/tracking?Campaign_ID=@@Campaign_ID@@&BID_ID=@@BID_ID@@",
 "Filter_GEO" : "()",
 "Filter_URLs" : "()",
 "Filter_KeyWords" : "()",
 "Filter_Function" : "jobsPredict",
 "Num_Of_BIDs_Sent" : 2500,
 "Num_Of_BIDS_Won" : 152
 }
 }, function (error, response) {

 console.log("error ",error);
 console.log("response ",response);
 });*/


var Elasticsearch = {};

Elasticsearch.client = client;
Elasticsearch.logBid = function (data) {

    return;
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

Elasticsearch.logNoBid = function (data) {

    return;

    return new Promise(function (fulfill, reject) {

        client.create({
            index: 'bids',
            type: 'BIDs',
            body: data
        }, function (error, response) {

            fulfill();
            // console.log("error ",error);
            // console.log("response ",response);
        });
    });

};

Elasticsearch.incCountersForBidSent = function (data) {

    return new Promise(function (fulfill, reject) {

        client.bulk({
            body: [

                {update: {_index: 'rtb', _type: 'campaigns', _id: data.campaignId}},
                {script: 'ctx._source.Num_Of_BIDs_Sent += 1', upsert: {counter: 1}},


                {update: {_index: 'rtb', _type: 'dailyStat', _id: data.date}},
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

Elasticsearch.getDailyNumOfBid = function (data) {

    return new Promise(function (fulfill, reject) {

        Elasticsearch.client.search({
            index: 'rtb',
            type: 'dailyStat',
            id: data.date,
            body: {}
        }).then(function (resp) {
            var hits = resp.hits.hits;


            try {
                var count = hits[0]._source.counter;
                //console.log("count ", count);
                fulfill(count);
            } catch (e) {
                reject();
            }


        }, function (err) {
            console.trace(err.message);
            reject();
        });
    });

};

module.exports = Elasticsearch;