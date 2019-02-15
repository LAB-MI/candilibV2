var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  if (err) {
    console.error(err)
    return
  }
  conn.createChannel(function(err, ch) {
    var queueName = 'candilib';

    ch.assertQueue(queueName, {durable: false});
    console.log(`[*] Waiting for messages in ${queueName}. To exit press CTRL+C`);
    ch.consume(queueName, function(msg) {
      console.log(msg.content.toString());
    }, {noAck: true});
  });
});
