/**
 * index.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var TradeBotApp = function() {
    
    'use strict';

    
    // Environment variables
    var env = (!process.argv.slice(2) || process.argv.slice(2) === null || process.argv.slice(2) === undefined || process.argv.slice(2).length === 0) ? "default" : process.argv.slice(2);
    process.env['NODE_ENV'] = env;
    
    
    
    // Import
    const winston       = require('winston');
    const config        = require('config');
    var app             = require('express')();
    var server          = require('http').createServer(app);
    var logger          = require('./common/log.js');
    var argv            = require('minimist')(process.argv.slice(2));

    
    //Load Config
    require('./config.js')(app);

    // Runtime
    logger.info('index.js | Starting server (environment='+env+')...');
    server.listen(config.get('server.port'), function() {
        logger.info('index.js | Server is running!', { port: config.get('server.port') });
        
        //Data loader
        var database = require('./jobs/data-loader.js')(__dirname);
        
        
        var dummyTradeBot        = require('./jobs/trade-bot.js')(__dirname, config.bots[0], database);
        
        // Start API
        var accountAPI      = require('./api/account.js')(app);
        var marketAPI       = require('./api/market.js')(app, __dirname, database);
        
        
        
    }); 
    
}();







