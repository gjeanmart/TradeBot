'use strict';

// Import
const config = require('config');
const logger = require('./common/log.js');

var bodyParser      = require('body-parser');

module.exports = function(app) {
    
    // ************************************************************
    // API
    app.use(function (req, res, next) {
        // Content Type
        res.header("Content-Type",'application/json');
        
        // CORS
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        // Cache
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        
        next();
    });

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        extended: true
    })); 
}

