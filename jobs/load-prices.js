'use strict';

// Imports
const config    = require('config');
const logger    = require('../common/log.js');
var rp          = require('request-promise');

var CronJob     = require('cron').CronJob;

/**
 * load-prices.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
module.exports = function() {

    // Initialization
    var cronjobs = [];

    for(var exchange of config.exchanges) {
        
        for(var pair of exchange.currency_pairs) {
            logger.debug('Setup price loader job for [Exchange: '+exchange.name+', pair='+pair+', cron='+config.load_prices.cron+']');
            
            cronjobs.push(scheduleJob(exchange, pair));
        }
    }  
    
    // scheduleJob
    function scheduleJob(exchange, pair) {
        try {
            
            var cron = { };
            
            cron.exchange   = exchange;
            cron.pair       = pair
            cron.job        = new CronJob(
                config.load_prices.cron, 
                function() {
                    logger.debug('Load price for ' + cron.exchange.name + ", pair " + cron.pair);
                    
                    rp({
                        method  : "GET",
                        uri     : cron.exchange.api_endpoint + "/public/getmarketsummary?market=" + pair  ,
                    
                    }).then(function(result) {
                        logger.debug(cron.exchange.api_endpoint + "/public/getmarketsummary?market=" + pair, result);
                    });  
                }, 
                function() {
                    logger.debug('Job stopped');
                }, 
                false, 
                config.server.timezone);
                
                
            // Start the cronjob
            cron.job.start(); 
            
            
            
            return cron;
            
        } catch(ex) {
            logger.error('cron ['+config.load_prices.cron+'] not valid: ' + ex);
        }  
    }
        
}



