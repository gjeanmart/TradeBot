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
        logger.debug("GET /api/v1/account/ ...", req.params);

        bittrex.getAccounts().then(function(result){
            res.send(result);
            
        }).catch(function(error) {
            logger.error(error);
            res.status(500).json(error);
        });
        
    });  
        
};

module.exports = accountAPI;