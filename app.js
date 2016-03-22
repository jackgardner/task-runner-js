'use strict';

const TaskQueue = require('./lib/taskQueue');
const K = require('kafka-lib');
const Kafka = K.Kafka;
const debug = require('debug')('mail-consumer:app');
const Promise = require('bluebird');

let consumer = null;
let taskQueue;
const logger = require('./lib/logging')({ logstashType: 'taskqueue' });

const strategies = [
  {
    strategy: 'TestStrategy',
    subscriptions: [ 'task-queue' ],
    handler: (messageSet, topic, partition) => {
      return Promise.each(messageSet, (m) => {
        const packet = JSON.parse(m.message.value);
        taskQueue.enqueue(packet);
        consumer.commitOffset({topic: topic, partition: partition, offset: m.offset, metadata: 'optional'});
      });
    }
  }
];

const KafkaBuilder = new Kafka({ strategies: strategies });


KafkaBuilder
  .consumer({ groupId: 'task-runner', asyncCompression: true })
  .then(() => {
    taskQueue = new TaskQueue(logger);
    consumer = KafkaBuilder._consumer;

    const api = require('./api/api')({}, logger, taskQueue);
    api.listen(process.env.PORT || 8080, function () {
      logger.info('Process', api.name, 'listening at', api.url);
    });

  });



process.on("unhandledRejection", function(reason, promise) {
  // See Promise.onPossiblyUnhandledRejection for parameter documentation
  logger.error(reason)
});

// NOTE: event name is camelCase as per node convention
process.on("rejectionHandled", function(promise) {
  console.log('Test ---')

  // See Promise.onUnhandledRejectionHandled for parameter documentation
});
