var Memcached = require('memcached');

var memcachedAddr = process.env.MEMCACHE_PORT_11211_TCP_ADDR || 'localhost';
var memcachedPort = process.env.MEMCACHE_PORT_11211_TCP_PORT || '11211';
var memcached = new Memcached(memcachedAddr + ':' + memcachedPort);

var Memcache = {};

console.log("Memcached ");

Memcache.getDateStr = function () {
    var now = new Date();
    var date = now.getDate() + "-" + now.getMonth() + 1 + "-" + now.getFullYear();
    return date;
};

Memcache.incDailyNumOfBid = function () {
    console.log("incDailyNumOfBid ");
    var self = this;
    var key = this.getDateStr() + "_DailyNumOfBid";

    return new Promise(function (fulfill, reject) {


        memcached.incr(key, 1, function (err) {

            console.log("incDailyNumOfBid err", err);
            if (err) reject(err);
            else fulfill();

        });
    });

};

Memcache.getDailyNumOfBid = function () {
    var self = this;
    var key = self.getDateStr() + "_DailyNumOfBid";

    return new Promise(function (fulfill, reject) {


        memcached.get(key, function (err, data) {
            console.log(err);
            console.log(data);
            if (err) reject(err);
            else fulfill(data);
        });


    });
};

Memcache.getDailyNumOfBid();
module.exports = Memcache;
