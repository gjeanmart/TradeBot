'use strict';

// Imports
const config    = require('config');
const logger    = require('../common/log.js');

var CronJob     = require('cron').CronJob;

module.exports = function() {

    try {
        new CronJob(
            '* * * * * *', 
            function() {
                logger.debug('You will see this message every second');
            }, 
            function() {
                logger.debug('Job stopped');
            }, 
            true,  // autostart
            'GMT');
        
        
    } catch(ex) {
        logger.error('cron pattern not valid');
    }
}



