// common/log.js

'use strict';

var config      = require('config');
var moment      = require('moment');
const winston   = require('winston');

/**
 * log.js
 * @description: TODO
 * @author: Gregoire Jeanmart <gregoire.jeanmart@gmail.com>
 */
module.exports = new (winston.Logger)({
    level           : config.get('logging.level'),
    transports      : [
        new (winston.transports.Console)({
          formatter: function(options) {
            return moment().format() +' '+ options.level.toUpperCase() +' '+ (options.message ? options.message : '') +
              (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
          }
        })
    ]
});