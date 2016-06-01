var cluster = require('cluster');
var os = require('os');
var async = require('async');
var https = require('https');
var fs = require('fs');


var startServer = function () {

    if (cluster.isMaster) {

        var numWorkers = require('os').cpus().length;

        if (process.env.DEV == 'true') {
               numWorkers = 1;
        }

        //numWorkers = 1;
        console.log('Master cluster setting up ' + numWorkers + ' workers...');

        for (var i = 0; i < numWorkers; i++) {
            cluster.fork();
        }

        cluster.on('online', function (worker) {
            console.log('Worker ' + worker.process.pid + ' is online');
            //console.log(worker.process);
        });

        cluster.on('exit', function (worker, code, signal) {
            console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
            console.log('Starting a new worker');
            cluster.fork();
        });


    }
    else {

        /*if (!process.env.DEV) {
            //require('@google/cloud-debug');
        }*/

        var http = require('http');


        var app = require('../app');


        http.globalAgent.maxSockets = Infinity;

        var httpServer = http.createServer(app).listen(process.env.PORT || 3000);

    }
};

var preStartServer = function () {

    async.parallel([
        function (callback) {

            var downloadFile = function (url, dest, cb) {
                var file = fs.createWriteStream(dest);
                var request = https.get(url, function (response) {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close(cb);  // close() is async, call cb after close completes.
                    });
                }).on('error', function (err) {

                    // Handle errors
                    fs.unlink(dest); // Delete the file async. (But we don't check the result)
                    if (cb) cb(err.message);
                });
            };


            try {

                fs.open(__dirname + '/../GeoIP2-City.mmdb', 'r', function (err, fd) {
                    console.log(err);
                    //console.log(fd);

                    if (err) {
                        downloadFile("https://storage.googleapis.com/tt-bucket/GeoIP2-City.mmdb", __dirname + "/../GeoIP2-City.mmdb", function (err) {
                            console.log("finishDownload", err);
                            if (!err) {
                                callback();
                            }
                        })
                    } else {
                        callback();
                    }

                });


            }
            catch (e) {
                console.log('loadReader err', e);
                //callback();
            }
        }
    ], function (err, results) {
        startServer();
    });

};


preStartServer();