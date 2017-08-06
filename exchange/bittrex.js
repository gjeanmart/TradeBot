/**
 * bittrex.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var bittrexAPI = function() {

    'use strict';

    var config      = require('config'),
        logger      = require('../common/log.js'),
        api         = require('node.bittrex.api');

        
    api.options({
        'apikey'    : config.exchanges.bittrex.api_key,
        'apisecret' : config.exchanges.bittrex.api_sec,
        'verbose'   : config.logging.level === "debug"
    });
    
    
    
    
    return {
        
        // getMarketPrice
        'getMarketPrice': function(pair) {
            
            return new Promise((resolve, reject) => {
                
                api.getmarketsummary({'market': pair}, function( data, err ) {
                    if (err) {
                        return reject({
                            'timestamp'   : Date.now(),
                            'code'        : "000",
                            'message'     : "todo",
                            'debug'       : err
                        });
                    }

                    return resolve({
                        'exchange'      : "bittrex",
                        'pair'          : data.result[0].MarketName,
                        'timestamp'     : data.result[0].TimeStamp,
                        'volume'        : data.result[0].Volume,
                        'high'          : data.result[0].High,
                        'low'           : data.result[0].Low,
                        'last'          : data.result[0].Last,
                        'bid'           : data.result[0].Bid,
                        'ask'           : data.result[0].Ask
                    });
                    
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



