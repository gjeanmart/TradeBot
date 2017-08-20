/**
 * bittrex.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var bittrexAPI = function() {

    'use strict';

    var config      = require('config'),
        logger      = require('../common/log.js'),
        api         = require('node.bittrex.api'),
        moment      = require('moment');

        
    api.options({
        'apikey'    : config.exchanges.bittrex.api_key,
        'apisecret' : config.exchanges.bittrex.api_sec,
        'verbose'   : config.logging.level === "debug"
    });
    
    
    
    
    return {
        
        // Market History
        'getMarketHistory': function(pair, start) {
            logger.debug("bittrex.js | getMarketHistory(pair="+pair+", start="+start+")");
            
            return new Promise((resolve, reject) => {
                
                api.getcandles({
                    'marketName'      : pair,
                    'tickInterval'    : "oneMin", 
                    '_'               : start // Doesn't work
                }, function(data, err) {
                    if (err) {
                        logger.error("bittrex.js | getMarketHistory(pair="+pair+", start="+start+")",err);
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }
                    var res = [];
                    for(var r of data.result) {
                        var record = {
                            'timestamp'     : moment(r.T + "Z").toDate(),
                            'open'          : parseFloat(r.O),
                            'close'         : parseFloat(r.C),
                            'high'          : parseFloat(r.H),
                            'low'           : parseFloat(r.L),
                            'volume'        : parseFloat(r.V)
                        };
                        res.push(record);
                    }

                    return resolve(res);
                });
            });
        },
        
        // Market Summary
        'getMarketSummary': function(pair) {
            logger.debug("bittrex.js | getMarketSummary(pair="+pair+")");
            
            return new Promise((resolve, reject) => {
                
                api.getmarketsummary({
                    'market'      : pair
                }, function(data, err) {
                    if (err) {
                        logger.error("bittrex.js | getMarketSummary(pair="+pair+")",err);
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }

                    var res = {
                        'timestamp'     : moment(data.result[0].TimeStamp + "Z").toDate(),
                        'ask'           : parseFloat(data.result[0].Ask),
                        'bid'           : parseFloat(data.result[0].Bid),
                        'last'          : parseFloat(data.result[0].Last),
                        'high'          : parseFloat(data.result[0].High),
                        'low'           : parseFloat(data.result[0].Low),
                        'volume'        : parseFloat(data.result[0].Volume)
                    };

                    return resolve(res);
                });
            });
        },
        
        // getAccounts
        'getAccounts': function() {
            
            return new Promise((resolve, reject) => {
                
                api.getbalances(function( data, err ) {
                    if (err) {
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }

                    var result = [];
                    for(var d of data.result) {
                        result.push({
                            'exchange'      : "bittrex",
                            'currency'      : d.Currency,
                            'balance'       : d.Balance
                        });
                    }
                    
                    return resolve(result);
                    
                });
                    
            });
        },
        
        // getAccounts
        'getBalance': function(currency) {
            
            return new Promise((resolve, reject) => {
                
                api.getbalance({ currency : currency }, function(data, err) {
                    if (err) {
                        logger.error("bittrex.js | getBalance(currency="+currency+")", err);
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }

                    var res = {
                        'currency'          : currency,
                        'balance'           : parseFloat(data.result.Balance)
                    };

                    return resolve(res);
                });
                    
            });
        },
        
        // buyLimit
        'buyLimit': function(pair, quantity, rate) {
            
            return new Promise((resolve, reject) => {
                
                var url = "https://bittrex.com/api/v1.1/market/buylimit?market="+pair+"&quantity="+quantity+"&rate="+rate
                
                api.sendCustomRequest(url, function(data, err) {
                    if (err) {
                        logger.error("bittrex.js | buyLimit(pair="+pair+", quantity="+quantity+", rate="+rate+")", err);
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }
                    
                    logger.info("bittrex.js | buyLimit(pair="+pair+", quantity="+quantity+", rate="+rate+") success (uuid="+data.result.uuid+")");
                    
                    return resolve();
                }, true);
                    
            });
        },
        
        // sellLimit
        'sellLimit': function(pair, quantity, rate) {
            
            return new Promise((resolve, reject) => {
                
                var url = "https://bittrex.com/api/v1.1/market/selllimit?market="+pair+"&quantity="+quantity+"&rate="+rate
                
                api.sendCustomRequest(url, function(data, err) {
                    if (err) {
                        logger.error("bittrex.js | sellLimit(pair="+pair+", quantity="+quantity+", rate="+rate+")", err);
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }
                    
                    logger.info("bittrex.js | sellLimit(pair="+pair+", quantity="+quantity+", rate="+rate+") success (uuid="+data.result.uuid+")");
                    
                    return resolve();
                }, true);
                    
            });
        },
        
        // getOpenOrders
        'getOpenOrders': function(pair) {
            
            return new Promise((resolve, reject) => {
                
                var url = "https://bittrex.com/api/v1.1/market/getopenorders?market="+pair
                
                api.sendCustomRequest(url, function(data, err) {
                    if (err) {
                        logger.error("bittrex.js | getOpenOrders(pair="+pair+")", err);
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }
                    
                    logger.info("bittrex.js | getOpenOrders(pair="+pair+") success (uuid="+data.result.uuid+")");
                    
                    return resolve(data.result);
                }, true);
                    
            });
        }   
    };
        
        
}();

module.exports = bittrexAPI;



