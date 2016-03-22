const K = require('kafka-lib');
const Kafka = K.Kafka;

module.exports = function () {
  var producer;

  new Kafka().producer({partitioner: K.PartitionerStrategies.AlwaysZero, groupId: 'agc-queue-connector' })
    .then(_producer => {
      producer = _producer;
    });


  return {
    send: function (topic, message) {
      producer.send({
        topic: topic,
        message: {
          value: JSON.stringify(message)
        }
      });
    }
  }

};