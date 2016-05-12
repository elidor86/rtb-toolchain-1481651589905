const Aerospike = require('aerospike');

var Client = null;

//var TTL_IMPRESSION_REC = 1 * 60 * 60 * 24;
var TTL_IMPRESSION_REC = 10;
var TTL_IMPRESSION_REC = 1000 * 60 * 60 * 24;


var AerospikeService = {};


AerospikeService.incUserImpressionPerCampaign = function (bidData) {

    if (!bidData) {
        console.log('incUserImpressionPerCampaign no bidData');
        return;
    }

    var recId = bidData.IP + "_" + bidData.Browser + "_" + bidData.Campaign_ID;
    var key = new Aerospike.Key('rtb', 'impressions', recId);


    return new Promise(function (fulfill, reject) {

        Client.exists(key, function (error, metadata, Key) {
            if (error && error.code === Aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND) {

                Client.put(key, {"count": 1, ts: new Date().getTime()}, null, function (error) {
                    if (error) {
                        console.log('error: %s', error.message)
                    } else {
                        console.log('Record written to database successfully.')
                    }
                });

            } else if (error) {
                // handle error
            } else {
                Client.incr(key, {'count': 1}, function (err, res) {

                    console.log("err ", err);
                    console.log("res ", res);

                    Client.get(key, function (error, record, metadata) {
                        if (error) {
                            switch (error.code) {
                                case Aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND:
                                    console.log('NOT_FOUND -', key);

                                    break;
                                default:
                                    console.log('ERR - ', error, key);

                            }
                        } else {
                            console.log('OK - ', key, metadata, record);

                        }

                    });
                });
            }
        })
    });

};


AerospikeService.deleteRec = function (rec_id) {
    var key = new Aerospike.Key('rtb', 'impressions', rec_id);

    Client.remove(key, function (error, key) {
        if (error) {
            // handle failure
        } else {
            // handle success
        }
    });

};


AerospikeService.getUserImpressionPerCampaign = function (bidData, campaign) {
    var recId = bidData.IP + "_" + bidData.Browser + "_" + campaign.Campaign_ID;
    var key = new Aerospike.Key('rtb', 'impressions', recId);


    return new Promise(function (fulfill, reject) {
        //reject({error:500});
        Client.get(key, function (error, record, metadata) {
            if (error) {
                switch (error.code) {
                    case Aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND:
                        console.log('NOT_FOUND -', key);
                        fulfill(0);
                        break;
                    default:
                        console.log('ERR - ', error, key);
                        reject(error);
                }
            } else {
                console.log('OK - ', key, metadata, record);

                var now = new Date(), recTs = record.ts;
                var diff = now - recTs;

                if (diff > TTL_IMPRESSION_REC) {
                    fulfill(0);
                    Client.remove(key, function (error, key) {
                        console.log('remove UserImpressionPerCampaign - ', key, error);
                    })
                } else {
                    fulfill(record.count);
                }
            }
        });
    });
};

Aerospike.connect({
    hosts: '23.251.151.232:3000', policies: {
        timeout: 2000
    }
}, function (error, client) {

    console.log("Aerospike.connect error", error);
    Client = client;
    //  AerospikeService.deleteRec('88.174.206.170_chrome_4');
    //var key = new Aerospike.Key('rtb', 'impressions', 'userIp_Browser_51');


    /* client.put(key, {"2":0}, function (error) {
     if (error) {
     console.log('error: %s', error.message)
     } else {
     console.log('Record written to database successfully.')
     }
     });*/


    //  AerospikeService.incUserImpressionPerCampaign();
    /* var key = new Aerospike.Key('test', 'rtb1', 1);
     var bins = { s: 'strsdf'};


     client.put(key, bins, function (error) {
     console.log(error);

     client.get(key, function (error, record, meta) {


     console.log(record, meta)
     })
     })*/
});


module.exports = AerospikeService;