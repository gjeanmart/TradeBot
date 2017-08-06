/**
 * bittrex.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var db = function() {

    'use strict';

    // Imports
    var config      = require('config'),
        logger      = require('../common/log.js'),
        Datastore   = require('nedb');

    // Initialization
    var pricesDb = new Datastore(config.database.prices);
    pricesDb.loadDatabase(function (err) {
        if(err) {
            logger.error("Error while loading pricesDb", err);
        }
    });
        
    return { 
        'prices': pricesDb
    };  
};

module.exports = db;



