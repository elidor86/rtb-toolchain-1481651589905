var cluster = require('cluster');
var os = require('os');
var async = require('async');
var https = require('https');
var fs = require('fs');
var cfenv = require('cfenv');

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


        var http = require('http');


        var app = require('../app');


        http.globalAgent.maxSockets = Infinity;
        var appEnv = cfenv.getAppEnv();
        console.log("appEnv.port ", appEnv.port);
        var httpServer = http.createServer(app).listen(appEnv.port || 3000);

    }
};

startServer();
