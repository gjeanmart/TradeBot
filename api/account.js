/**
 * account.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
var accountAPI = function(app) {

    'use strict';
    
    var config      = require('config'),
        logger      = require('../common/log.js'),
        bittrex     = require('../exchange/bittrex.js');

        
    app.get('/api/v1/account/', (req, res) => {
        logger.debug("GET /api/v1/account/ ...", req.query);

        
        var promises = [];
        Object.keys(config.exchanges).forEach(function(exchange) {

            if(exchange === "bittrex") {
                promises.push(bittrex.getAccounts());
                
            } else {
                logger.warn("Unknow exchange", exchange)
            }
            
        }); 
        

        Promise.all(promises).then(function(data){ 
        
            var result = [];
            for(var r of data) { result.push(...r); }

            res.send(result);
            
         }).catch(function(error) {
            logger.error(error);
            res.status(500).json(error);
        });
        
    });  
        
};

module.exports = accountAPI;