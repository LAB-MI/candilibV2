var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  console.error({ err, conn })

  conn.createChannel(function(err, ch) {
    var q = 'hello';

    ch.assertQueue(q, {durable: false});
    // Note: on Node 6 Buffer.from(msg) should be used
    ch.sendToQueue(q, new Buffer(JSON.stringify({foo: 'bar'})));
    console.log(" [x] Sent 'Hello World!'");
  });
});
