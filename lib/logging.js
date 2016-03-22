const bunyan = require('bunyan');
const process = require('process');


module.exports = function (options) {
  const loggingStreams = [];

  if (process.env.DEBUG) {
    const PrettyPrinterStream = require('../PrettyPrinterStream');
    loggingStreams.push({
      level: 'debug',
      stream: new PrettyPrinterStream()
    });
  }

  if (process.env.LOGSTASH_URL) {
    loggingStreams.push({
      type: 'raw',
      level: 'debug',
      stream: require('bunyan-logstash').createStream({
        type: options.logstashType,
        tags: [ 'bunyan', process.env.NODE_ENV || 'local' ],
        host: process.env.LOGSTASH_URL || '127.0.0.1',
        port: process.env.LOGSTASH_PORT || 5505
      })
    });
  }
  return bunyan.createLogger({
    name: 'server',
    serializers: bunyan.stdSerializers,
    streams: loggingStreams
  });
};