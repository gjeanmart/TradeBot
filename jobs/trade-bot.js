/**
 * trade-bot.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var tradeBot = function(database, params) {

    'use strict';

    // Imports
    var config      = require('config'),
        logger      = require('../common/log.js'),
        CronJob     = require('cron').CronJob,
        bittrex     = require('../exchange/bittrex.js'),
        moment      = require('moment');

    // Initialization
    logger.debug("Setup trade-bot | params=", params);

    try {
        var job = new CronJob(
            config.jobs.trade_bot.cron, 
            function() { logic(); },
            null,
            true, 
            config.server.timezone
        );

    } catch(ex) {
        logger.error('cron ['+config.jobs.trade_bot.cron+'] not valid: ' + ex);
    }
    
    // Logic 
    function logic() {
        logger.debug("run trade-bot ...");

        calculatePercentageChange(1, "hour");
        calculatePercentageChange(1, "day");
        calculatePercentageChange(7, "days");
    } 
    
    function calculatePercentageChange(val, unit) {    
        var promises = [];
        Object.keys(config.exchanges).forEach(function(key) {
            var exchange = config.exchanges[key];
            exchange.name = key;
          
            for(var pair of exchange.currency_pairs) {

                promises.push(new Promise(function(resolve, reject) {
                    database.prices.find({ 
                        'pair'      : pair, 
                        'timestamp' : { 
                            '$gte'      : moment().utc().subtract(val, unit).toDate(),
                            '$lte'      : moment().utc().toDate()
                        } 
                    }).sort({ 
                        'timestamp': 1 
                    }).exec(function(err, doc) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(doc)
                        }
                    });
                }));
                
            }
        });  
        
        Promise.all(promises).then(function(data){ 

            Object.keys(data).forEach(function(key) {

                if(data[key].length === 0) {
                    logger.warn("No data", data);
                    return ;
                }
            
                var exchange    = data[key][0].exchange,
                    pair        = data[key][0].pair;
              
              
                var volumeStart = data[key][0].volume;
                var volumeEnd = data[key][data[key].length-1].volume;
                var volumePercentage = ((volumeEnd - volumeStart) / volumeStart) * 100;
                logger.debug(exchange + " - " + pair + " - volumePercentage (val="+val+", unit="+unit+")="+volumePercentage);
              
              
              
                var bidStart = data[key][0].bid;
                var bidEnd = data[key][data[key].length-1].bid;
                var bidPercentage = ((bidEnd - bidStart) / bidStart) * 100;
                logger.debug(exchange + " - " + pair + " - bidPercentage (val="+val+", unit="+unit+")="+bidPercentage);
              
              
              
                var askStart = data[key][0].ask;
                var askEnd = data[key][data[key].length-1].ask;
                var askPercentage = ((askEnd - askStart) / askStart) * 100;
                logger.debug(exchange + " - " + pair + " - askPercentage (val="+val+", unit="+unit+")="+askPercentage);
              
                

            });
            
        }).catch(function(error) {
            logger.error(error);
        });
    }

    return {};
        
};

module.exports = tradeBot;
