/**
 * trade-bot.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var tradeBot = function(baseDir, params, database) {

    'use strict';

    // Imports
    var config      = require('config'),
        Datastore   = require('nedb'),
        moment      = require('moment'),
        CronJob     = require('cron').CronJob,
        logger      = require('../common/log.js'),
        bittrex     = require('../exchange/bittrex.js');

    // Initialization
    logger.info("trade-bot.js | Setup trade-bot [name: "+params.name+", strategy: "+params.strategy+", cron: "+params.cron+", exchanges: "+params.exchanges+", currencies: "+params.currencies+", ]");
    
    try {
        var job = new CronJob(
            params.cron, 
            function() { logic(); },
            null,
            true, 
            config.server.timezone
        );

    } catch(ex) {
        logger.error('trade-bot.js | cron ['+params.cron+'] not valid: ' + ex);
    }
    
    // Logic 
    function logic() {
        logger.info("trade-bot.js | run trade-bot ...");

        var oneHour = {};
        var oneDay = {};
        var oneWeek = {};
        
        calculatePercentageChange(1, "hour").then(function(result) {
            oneHour = result;
            return calculatePercentageChange(1, "day");
        }).then(function(result) {
            oneDay = result;
            return calculatePercentageChange(7, "days");
        }).then(function(result) {
            oneWeek = result;

            var promises = [];
            for(var exchange of params.exchanges) {
                for(var pair of params.currencies) {
                    if(exchange === "bittrex") {
                        promises.push(bittrex.getMarketSummary(pair));   
                    }
                }
            }
            
            return Promise.all(promises);  
        }).then(function(result) {
            
            logger.debug("oneHour", oneHour);
            logger.debug("oneDay", oneDay);
            logger.debug("oneWeek", oneWeek);
            logger.debug("promises", result);
            
        });  
    } 
    
     function calculatePercentageChange(val, unit) {   

        return new Promise(function(resolve, reject) {
            
            var promises = [];
            
            for(var exchange of params.exchanges) {
                for(var pair of params.currencies) {

                    promises.push(new Promise(function(resolve, reject) {
                        database[exchange][pair].find({ 
                            'timestamp' : { 
                                '$gte'      : moment().utc().subtract(val, unit).toDate(),
                                '$lte'      : moment().utc().toDate()
                            } 
                        }).sort({ 
                            'timestamp': 1 
                        }).exec(function(err, doc) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({exchange: exchange, pair: pair, doc: doc});
                            }
                        });
                    }));
                    
                }
            } 
            
            Promise.all(promises).then(function(data){ 

                var result = {};
                Object.keys(data).forEach(function(key) {

                    if(data[key].length === 0) {
                        logger.warn("trade-bot.js | No data", data);
                        return ;
                    }
                
                    var exchange    = data[key].exchange,
                        pair        = data[key].pair;
   
                    var volume = data[key].doc[data[key].doc.length-1].volume;

                    var priceStart = data[key].doc[0].close;
                    var priceEnd = data[key].doc[data[key].doc.length-1].close;
                    var pricePercentageChg = ((priceEnd - priceStart) / priceStart) * 100;
                    
                    
                    result[exchange] = {};
                    result[exchange][pair] = {
                        pricePercentageChg: pricePercentageChg,
                        volume: volume
                    };
                });

                return resolve(result);
                
            }).catch(function(error) {
                logger.error(error);
                return reject(error);
            });
            
        });

    }

    return job;
        
};

module.exports = tradeBot;
