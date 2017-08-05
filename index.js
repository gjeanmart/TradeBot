'use strict';

// Import
const winston       = require('winston');
const config        = require('config');
var app             = require('express')();
var server          = require('http').createServer(app);

// ************************************************************
// Logging
var logger      = require('./common/log.js');



//Load Config
require('./config.js')(app);


// Runtime
logger.info('Starting server ...');
server.listen(config.get('server.port'), function() {
    logger.info('Server is running!', { port: config.get('server.port') });
});



//Load Jobs
require('./jobs/load-prices.js')();
