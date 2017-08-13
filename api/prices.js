/**
 * prices.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var pricesAPI = function(app, database) {

    'use strict';
    
    var config      = require('config'),
        Datastore   = require('nedb'),
        logger      = require('../common/log.js'),
        bittrex     = require('../exchange/bittrex.js');

        
    app.get('/api/v1/prices/', (req, res) => {
        logger.debug("GET /api/v1/prices/ ...", req.query);
        
        var db = new Datastore({ filename: config.database.folder+'/'+req.query.exchange+'-'+req.query.pair+'.db', autoload: true });
        
        db.find({}).sort({ timestamp: 1 }).exec(function (err, docs) {
            if(err) {
                logger.error("Error while finding the price in the DB",err);
                res.status(500).json(err);
            }

            res.send(docs);
        });        
    });  
        
};

module.exports = pricesAPI;