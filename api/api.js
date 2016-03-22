const restify = require('restify');

module.exports = function (options, logger, taskQueue) {

  const server = restify.createServer({
    name: 'task-runner',
    version: '1.0.0',
    log: logger
  });

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());


  server.use(function (req, res, next) {
    req.taskQueue = taskQueue;
    req.logger = logger;

    next();
  });

  const routes = require('./routes')(server);

  return server;
};