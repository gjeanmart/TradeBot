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
    var pricesDb = new Datastore({ 'filename': config.database.price });
    pricesDb.loadDatabase(function (err) {    // Callback is optional
        if(err) {
            logger.error("Error while loading pricesDb", err);
        }
    });
        
    return { 
        'prices': pricesDb
    };  
};

module.exports = db;



