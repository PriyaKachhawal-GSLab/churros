'use strict';

const winston = require('winston');

module.exports = (level) => {
  winston
    .remove(winston.transports.Console)
    .add(winston.transports.Console, { level: level })
    .add(winston.transports.File, {
      filename: __dirname + '/../../churros.log',
      level: 'info'
    });

  winston.info('Initializing loggers...');
  return winston;
};
