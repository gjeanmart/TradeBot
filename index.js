/**
 * index.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var TradeBotApp = function() {
    
    'use strict';

    // Import
    const winston       = require('winston');
    const config        = require('config');
    var app             = require('express')();
    var server          = require('http').createServer(app);
    var logger          = require('./common/log.js');

    //Load Config
    require('./config.js')(app);

    // Runtime
    logger.info('index.js | Starting server ...');
    server.listen(config.get('server.port'), function() {
        logger.info('index.js | Server is running!', { port: config.get('server.port') });
        
        //Data loader
        require('./jobs/data-loader.js')();
        
        
        //var tradeBot        = require('./jobs/trade-bot.js')(database, {});
        
        // Start API
        var accountAPI      = require('./api/account.js')(app);
        var pricesAPI       = require('./api/prices.js')(app);
        
        
        
    }); 
    
}();







