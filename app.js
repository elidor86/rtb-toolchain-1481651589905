var path = require('path');
global.appRoot = path.resolve(__dirname);

var winston = require('./lib/winston');
//var db = require('./lib/db');


var express = require('express');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

var routes = require('./routes/index');
var tracking = require('./routes/tracking');
var stats = require('./routes/stats');

var app = express();
app.disable('etag');


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/tracking', tracking);
app.use('/stats', stats);


module.exports = app;
