var Memcached = require('memcached');


var memcachedAddr = process.env.MEMCACHE_PORT_11211_TCP_ADDR || 'localhost';
//var memcachedAddr = process.env.MEMCACHE_PORT_11211_TCP_ADDR || '172.17.0.3';
var memcachedPort = process.env.MEMCACHE_PORT_11211_TCP_PORT || '11211';
var memcached = new Memcached(memcachedAddr + ':' + memcachedPort);


var TTL_IMPRESSION_REC = 1000 * 60 * 60 * 12;

var memcachedService = {};

memcachedService.incUserImpressionPerCampaign = function (bidData) {

    if (!bidData) {
        console.trace('incUserImpressionPerCampaign no bidData');
        return;
    }

    var recId = bidData.IP + "_" + bidData.Browser + "_" + bidData.Campaign_ID;


    return new Promise(function (fulfill, reject) {

        memcached.get(recId, function (err, value) {
            if (err) {
                return;
            }

            //console.log('memcached.get value', value);
            //console.log('memcached.get err', err);

            if (!value) {

                memcached.set(recId, {"count": 1, ts: new Date().getTime()}, 60 * 60 * 20, function (err) {
                    if (err) {
                        console.trace(" memcached.set err ", err)
                    }
                });

            } else {


                value.count += 1;

                //console.log('incUserImpressionPerCampaign no value ', value);

                memcached.set(recId, value, 60 * 60 * 20, function (err) {

                    if (err) {
                        console.trace(" memcached.set err ", err)
                    }
                });

            }


        });

    });

};

memcachedService.getUserImpressionPerCampaign = function (bidData, campaign) {
    var recId = bidData.IP + "_" + bidData.Browser + "_" + campaign.Campaign_ID;

    var ttl = campaign.ttl || TTL_IMPRESSION_REC;

    return new Promise(function (fulfill, reject) {


        memcached.get(recId, function (err, value) {
            //console.log("err ", err);
            //console.log("value ", value);

            if (err) {
                return reject(err);
            }

            if (!value) {
                return fulfill(0);
            } else {

                var now = new Date(), recTs = value.ts;
                var diff = now - recTs;
                if (diff > ttl) {
                    fulfill(0);
                    memcached.del(recId, function (error, key) {
                    });
                } else {
                    fulfill(value.count);
                }

            }


        });


    });
};

module.exports = memcachedService;