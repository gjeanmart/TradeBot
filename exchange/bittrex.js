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
                    '_'               : start
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
        }    
    };
        
        
}();

module.exports = bittrexAPI;



