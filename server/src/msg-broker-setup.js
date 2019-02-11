import amqp from 'amqplib/callback_api'

import logger from './util/logger'

const amqpHost = process.env.AMQP_HOST || 'localhost'

const queueName = 'hello'

export default () => {
  return new Promise((resolve, reject) => {
    amqp.connect(
      `amqp://${amqpHost}`,
      function (err, connection) {
        if (err) {
          logger.warn('Could not connect to message broker')
          reject(err)
        }
        resolve()

        connection.createChannel(function (err, channel) {
          if (err) {
            logger.warn('Could not createChannel')
            reject(err)
          }
          resolve(channel)
        })
      }
    )
  })
}

export const addLog = (channel, msg) => {
  channel.assertQueue(queueName, { durable: false })
  const message = typeof msg === 'string' ? msg : JSON.stringify(msg)
  channel.sendToQueue(queueName, Buffer.from(message))
}
