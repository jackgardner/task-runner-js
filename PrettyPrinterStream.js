const stream = require('stream');
const util = require('util');
const bunyan = require('bunyan');
const Logger = require('nice-simple-logger');
const consoleLogger = new Logger({});

function PrettyPrinterStream() {
  stream.Writable.call(this);
}

util.inherits(PrettyPrinterStream, stream.Writable);

PrettyPrinterStream.prototype._write = function (chunk, encoding, done) {
  const obj = JSON.parse(chunk.toString('utf8'));
  var method = bunyan.nameFromLevel[parseInt(obj.level)];


  if (method === 'info') method = 'log';
  if (method === 'trace') method = 'debug';
  
  consoleLogger[method](obj.msg);

  done();
};

module.exports = PrettyPrinterStream;


