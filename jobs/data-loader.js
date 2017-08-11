/**
 * data-loader.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var dataLoader = function() {

    'use strict';

    // Imports
    var config      = require('config'),
        CronJob     = require('cron').CronJob,
        Datastore   = require('nedb'),
        fs          = require('fs'),
        csv         = require('csv'),
        logger      = require('../common/log.js'),
        bittrex     = require('../exchange/bittrex.js');

    // Initialization
    var cronjobs = [];

    Object.keys(config.exchanges).forEach(function(key) {
        var exchange = config.exchanges[key];
        exchange.name = key;
      
        for(var pair of exchange.currency_pairs) {
            logger.info("data-loader.js | Setup market data loader job for [Exchange: "+exchange.name+", pair="+pair.name+", cron="+config.jobs.load_prices.cron+"]");
            
            var db = new Datastore({ filename: config.database.folder+'/'+exchange.name+'-'+pair.name+'.db', autoload: true });
            
            db.find({}, function (err, docs) {
                if(err) {
                    logger.error("data-loader.js | Error while loading the database '"+config.database.folder+"/"+exchange.name+"-"+pair.name+".db'", err);
                } else {
                    if(docs.length === 0) {
                        logger.info("data-loader.js | Database is empty, load the historitical data ...");
                        
                        loadCSV(pair.historitical_data, db, exchange, pair);
                    } 
                    
                    //calculate GAP
                    
                }
            });
            
            //cronjobs.push(scheduleJob(exchange, pair));
        }
    });  

    function loadCSV(csvFile, database, exchange, pair) {
        logger.debug("data-loader.js | Load the historitical data [csvFile="+csvFile+", exchange="+exchange.name+", pair="+pair.name+"]");
                        
        var parser = csv.parse({'delimiter': ",", 'from': 4}, function(err, data){
            if(err) {
                logger.error("data-loader.js | Error while loading the historitical data file '"+pair.historitical_data+"'", err);
                return;
            }
             logger.debug("___");
             logger.debug(data);
             
             
             // ["6/25/2017 10:54:00 PM","0.10876993","0.10876993","0.10877994","0.10858413","13.26303219","1.44258963"
             
             
        });

        fs.createReadStream(pair.historitical_data).pipe(parser);
    }
    
    function fillGap(database, exchange, pair) {
        
    }
    
    // scheduleJob
    function scheduleJob(exchange, pair) {
        
        try {
            
            var cron = {};
            
            cron.exchange   = exchange;
            cron.pair       = pair;
            cron.job        = new CronJob(
                config.jobs.load_prices.cron, 
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
                true, 
                config.server.timezone
            );

            return cron;
            
        } catch(ex) {
            logger.error('cron ['+config.jobs.load_prices.cron+'] not valid: ' + ex);
        }  
    }
    
    return {};
        
};

module.exports = dataLoader;
