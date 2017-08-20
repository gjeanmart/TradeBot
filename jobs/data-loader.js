/**
 * data-loader.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var dataLoader = function(baseDir) {

    'use strict';

    // Imports
    var config      = require('config'),
        CronJob     = require('cron').CronJob,
        Datastore   = require('nedb'),
        fs          = require('fs'),
        csv         = require('csv'),
        moment      = require('moment'),
        logger      = require('../common/log.js'),
        bittrex     = require('../exchange/bittrex.js');

    // Initialization
    var cronjobs = [];
    var database = {};

    Object.keys(config.exchanges).forEach(function(key) {
        var exchange = config.exchanges[key];
        exchange.name = key;
        
        database[exchange.name] = {};
      
        for(var pair of exchange.currency_pairs) {
            logger.info("data-loader.js | Setup market data loader job for [Exchange: "+exchange.name+", pair="+pair.name+", cron="+config.parameters.data_loader.cron+"]");
            
            var db = new Datastore({ filename: baseDir + '/' + config.parameters.database.folder+'/'+exchange.name+'-'+pair.name+'.db', autoload: true });
            
            database[exchange.name][pair.name]=db;
            
            db.find({}, function (err, docs) {
                
                if(err) {
                    logger.error("data-loader.js | Error while loading the database '"+config.parameters.database.folder+"/"+exchange.name+"-"+pair.name+".db'", err);
                    
                } else {
                    if(!docs || docs.length === 0) {
                        logger.info("data-loader.js | Database is empty, load the historitical data ...");
                        
                        loadCSV(pair.historitical_data, db, exchange, pair).then(function(){
                            return fillGap(db, exchange, pair);
                            
                        }).then(function() {
                            cronjobs.push(scheduleJob(db, exchange, pair));
                        });
 
                    } else {
                        fillGap(db, exchange, pair).then(function(){
                            cronjobs.push(scheduleJob(db, exchange, pair));
                        });
                    } 
                }
            });
        }
    });  

    function loadCSV(csvFile, database, exchange, pair) {
        logger.debug("data-loader.js | Load the historitical data [csvFile="+csvFile+", exchange="+exchange.name+", pair="+pair.name+"]");
        
        return new Promise((resolve, reject) => {
            var parser = csv.parse({'delimiter': ","}, function(err, data){
                if(err) {
                    logger.error("data-loader.js | Error while loading the historitical data file '"+pair.historitical_data+"'", err);
                            
                    return reject({
                        'timestamp'   : Date.now(),
                        'code'        : "000",
                        'message'     : "todo",
                        'debug'       : err
                    });
                }
                
                Object.keys(data).forEach(function(key) {

                    var record = {
                        'timestamp'     : moment(data[key][0]).toDate(),
                        'open'          : parseFloat(data[key][1]),
                        'close'         : parseFloat(data[key][2]),
                        'high'          : parseFloat(data[key][3]),
                        'low'           : parseFloat(data[key][4]),
                        'volume'        : parseFloat(data[key][5])
                    };

                    database.insert(record, function (err, doc) { 
                        if(err) {
                            logger.error("data-loader.js | Error while inserting the record ["+JSON.stringify(record)+"] in the DB", err);
                            
                            return reject({
                                'timestamp'   : Date.now(),
                                'code'        : "000",
                                'message'     : "todo",
                                'debug'       : err
                            });
                        }

                        logger.debug("data-loader.js | Record inserted in the DB", record);
                        
                        return resolve();
                    });
                });

            });

            fs.createReadStream(baseDir + '/' + pair.historitical_data).pipe(parser);
        });
        

    }
    
    function fillGap(database, exchange, pair) {
        logger.debug("data-loader.js | Fill gap [exchange="+exchange.name+", pair="+pair.name+"]")
        
        return new Promise((resolve, reject) => {
            database.findOne().sort({ timestamp: -1 }).exec(function (err, doc) {
                if(err) {
                    logger.error("data-loader.js | Error while reading the latest record in the DB", err);
                    return reject({
                                'timestamp'   : Date.now(),
                                'code'        : "000",
                                'message'     : "todo",
                                'debug'       : err
                            });
                }

                if(exchange.name === "bittrex") {
                    bittrex.getMarketHistory(pair.name, moment(doc.timestamp).valueOf()).then(function(result){
                        logger.debug("data-loader.js | bittrex.getMarketHistory(pair="+pair.name+", start="+moment(doc.timestamp).valueOf()+") - nb records=" + result.length);

                        for(var r of result) {
                            if(r.timestamp > moment(doc.timestamp).valueOf()) {

                                // Insert the price in the DB
                                database.insert(r, function (err, doc) { 
                                    if(err) {
                                        logger.error("data-loader.js | Error while inserting the price in the DB",err);
                                    }

                                    logger.debug("data-loader.js | Records inserted in the DB", doc);
                                });
                            }
                        }
                        
                        return resolve();
                        
                    }).catch(function(error) {
                        logger.error("data-loader.js | bittrex.getMarketHistory(pair="+pair.name+", start="+moment(doc.timestamp).valueOf()+")", error);
                        
                        return reject({
                                'timestamp'   : Date.now(),
                                'code'        : "000",
                                'message'     : "todo",
                                'debug'       : error
                        });
                    }); 
                       
                } else {
                    logger.warn("data-loader.js | Unknow exchange", exchange);
                    
                    return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "Unknow exchange",
                            'debug'       : error
                    });
                }
            });
        });

    }
    
    // scheduleJob
    function scheduleJob(database, exchange, pair) {
        try {
            var cron = {};
            
            cron.exchange   = exchange;
            cron.pair       = pair;
            cron.job        = new CronJob(
                config.parameters.data_loader.cron, 
                function() {
                    logger.info('data-loader.js | Execute cron job to load data [exchange=' + exchange.name + ", pair=" + pair.name + '] ...');
                    
                    fillGap(database, exchange, pair).then(function() {
                        logger.info('data-loader.js | Execute cron job to load data [exchange=' + exchange.name + ", pair=" + pair.name + '] ended');
                    });
                }, 
                null, 
                true, 
                config.server.timezone
            );

            return cron;
            
        } catch(ex) {
            logger.error('data-loader.js | Cron ['+config.parameters.data_loader.cron+'] not valid: ' + ex);
        }  
    }
    
    return database;
        
};

module.exports = dataLoader;
