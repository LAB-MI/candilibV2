import SMTPServer from 'smtp-server'

export const buildSmtpServer = (port, done) => {
  const server = new SMTPServer.SMTPServer({
    disabledCommands: ['STARTTLS', 'PLAIN', 'XOAUTH2'],

    onAuth: function (auth, session, callback) {
      callback(null, {
        user: 123,
      })
    },
    onData: function (stream, session, callback) {
      stream.on('data', function () {})
      stream.on('end', callback)
    },

    onMailFrom: function (address, session, callback) {
      return callback() // Accept the address
    },
    onRcptTo: function (address, session, callback) {
      return callback()
    },
    logger: false,
  })

  server.listen(port, done)
  return server
}
