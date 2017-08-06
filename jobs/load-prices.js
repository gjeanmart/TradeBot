/**
 * load-prices.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var loadPrices = function(database) {

    'use strict';

    // Imports
    var config      = require('config'),
        logger      = require('../common/log.js'),
        CronJob     = require('cron').CronJob,
        bittrex     = require('../exchange/bittrex.js');

    // Initialization
    var cronjobs = [];

    Object.keys(config.exchanges).forEach(function(key) {
        var exchange = config.exchanges[key];
        exchange.name = key;
      
        for(var pair of exchange.currency_pairs) {
            logger.debug('Setup price loader job for [Exchange: '+exchange.name+', pair='+pair+', cron='+config.load_prices.cron+']');
            
            cronjobs.push(scheduleJob(exchange, pair));
        }
    });  

    
    
    // scheduleJob
    function scheduleJob(exchange, pair) {
        
        try {
            
            var cron = {};
            
            cron.exchange   = exchange;
            cron.pair       = pair;
            cron.job        = new CronJob(
                config.load_prices.cron, 
                function() {
                    logger.debug('Load price for ' + exchange.name + ", pair " + pair);
                    
                    if(exchange.name === "bittrex") {
                        bittrex.getMarketPrice(pair).then(function(result){
                            logger.debug("bittrex.getMarketPrice(cron.pair="+pair+")", result);

                            // Insert the price in the DB
                            database.prices.insert(result, function (err, doc) { 
                            
                                if(err) {
                                    logger.error("Error while inserting the price in the DB",err);
                                }

                                logger.debug("Price inserted in the DB", doc);
                            });
                            
                        }).catch(function(error) {
                            logger.error("bittrex.getMarketPrice(cron.pair="+pair+")", error);
                        });
                        
                    } else {
                        logger.warn("Unknow exchange", exchange)
                    }
 
                }, 
                null, 
                false, 
                config.server.timezone
            );
                
                
            // Start the cronjob
            cron.job.start(); 
            
            
            
            return cron;
            
        } catch(ex) {
            logger.error('cron ['+config.load_prices.cron+'] not valid: ' + ex);
        }  
    }
    
    return {};
        
};

module.exports = loadPrices;
