var Memcached = require('memcached');


var memcachedAddr = process.env.MEMCACHE_PORT_11211_TCP_ADDR || 'localhost';
var memcachedPort = process.env.MEMCACHE_PORT_11211_TCP_PORT || '11211';
var memcached = new Memcached(memcachedAddr + ':' + memcachedPort);


memcached.get('foottttt', function (err, value) {
    console.log("err ", err);
    console.log("value ", value);

});


memcached.set('foo', Math.random(), 60, function (err) {

    memcached.get('foo', function (err, value) {
        console.log("err ", err);
        console.log("value ", value);

    });
});

var memcachedService = {};


memcachedService.incUserImpressionPerCampaign = function (bidData) {

    if (!bidData) {
        console.log('incUserImpressionPerCampaign no bidData');
        return;
    }

    var recId = bidData.IP + "_" + bidData.Browser + "_" + bidData.Campaign_ID;




    return new Promise(function (fulfill, reject) {




        Client.exists(key, function (error, metadata, Key) {
            if (error && error.code === Aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND) {

                Client.put(key, {"count": 1, ts: new Date().getTime()}, null, function (error) {
                    if (error) {
                        console.log('error: %s', error.message)
                    } else {
                        //console.log('Record written to database successfully.')
                    }
                });

            } else if (error) {
                // handle error
            } else {
                Client.incr(key, {'count': 1}, function (err, res) {

                    //console.log("err ", err);
                    //console.log("res ", res);

                    Client.get(key, function (error, record, metadata) {
                        if (error) {
                            switch (error.code) {
                                case Aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND:
                                    //console.log('NOT_FOUND -', key);

                                    break;
                                default:
                                    console.log('ERR - ', error, key);

                            }
                        } else {
                            //console.log('OK - ', key, metadata, record);

                        }

                    });
                });
            }
        })
    });

};


memcachedService.deleteRec = function (rec_id) {
    var key = new Aerospike.Key('rtb', 'impressions', rec_id);

    Client.remove(key, function (error, key) {
        if (error) {
            // handle failure
        } else {
            // handle success
        }
    });

};


memcachedService.getUserImpressionPerCampaign = function (bidData, campaign) {
    var recId = bidData.IP + "_" + bidData.Browser + "_" + campaign.Campaign_ID;
    var key = new Aerospike.Key('rtb', 'impressions', recId);


    return new Promise(function (fulfill, reject) {
        //reject({error:500});
        Client.get(key, function (error, record, metadata) {
            if (error) {
                switch (error.code) {
                    case Aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND:
                        //console.log('NOT_FOUND -', key);
                        fulfill(0);
                        break;
                    default:
                        console.log('ERR - ', error, key);
                        reject(error);
                }
            } else {
                //console.log('OK - ', key, metadata, record);

                var now = new Date(), recTs = record.ts;
                var diff = now - recTs;

                if (diff > TTL_IMPRESSION_REC) {
                    fulfill(0);
                    Client.remove(key, function (error, key) {
                        //console.log('remove UserImpressionPerCampaign - ', key, error);
                    })
                } else {
                    fulfill(record.count);
                }
            }
        });
    });
};

