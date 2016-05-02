var path = require('path');
global.appRoot = path.resolve(__dirname);

var winston = require('./lib/winston');
var db = require('./lib/db');



var express = require('express');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

var routes = require('./routes/index');
var tracking = require('./routes/tracking');

var app = express();
app.disable('etag');

app.use(function (req, res, next) {


    try {
        var ip =
            req.headers['fastly-client-ip'] ||
            req.headers['x-appengine-user-ip'] ||
            req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        if (ip) {
            req.remoteIp = ip.replace("::ffff:", "");
        }
    } catch (e) {
        console.log("set ip error", e);
    }

    next();

});


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/tracking', tracking);


module.exports = app;
