var
    MongoClient = require('mongodb').MongoClient,
    fs = require('fs'),
    URL = require("url");


var ee = require("./events-emitter").event;

var path = require('path');

var url = 'mongodb://admin:adworks237@104.154.103.69:27017/rtb?3t.uriVersion=2&3t.connection.name=mongo-rtb&3t.connectionMode=direct&readPreference=primary';
//var url = 'mongodb://104.197.82.198:27017,130.211.174.149:27017/analytics?replicaSet=rs-tt';
//var url = 'mongodb://104.197.82.198:27017/analytics';

module.exports = {};


var collections = {};

try {

    console.log("start initDb ");

    MongoClient.connect(url, {
        server: {
            poolSize: 400
        },
        db: {
            w: 0
        }

    }, function (err, db) {
        console.log("Connected to server err ", err);

        if (err) {
            throw  JSON.stringify(err);
        }


        var databases = {
            "Campaigns": 'Campaigns',
            "BIDs": 'BIDs',
            "errors": 'errors',
            "dailyStat": 'dailyStat',
            "BIDs_Won": 'BIDs_Won',
            "BIDs_Sent": 'BIDs_Sent'
        };

        for (var v in databases) {
            collections[databases[v]] = db.collection(v);
        }


        ee.emit('mongoDbReady');

        console.log("Connected correctly to server");


    });
} catch (e) {
    console.log("----------MongoClient.connect error!!!--------- ", e);
}


ee.on("TTdbReady", function () {

});


module.exports = {
    collections: collections
};

