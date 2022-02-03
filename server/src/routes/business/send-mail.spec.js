import { smtpOptions } from '../../config'
import { addMailToSend, sendMails, sendMail } from './send-mail'
import { buildSmtpServer } from './__tests__/smtp-server'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../../config', () => ({
  smtpMaxConnections: 1,
  smtpRateDelta: 1000,
  smtpRateLimit: undefined,
  smtpMaxAttemptsToSend: 5,
  smtpOptions: {
    host: 'localhost',
    port: 20025,
    secure: false,
    tls: {
      // do not failed with selfsign certificates
      rejectUnauthorized: false,
    },
    auth: {
      user: 'test',
      pass: 'test',
    },
  },
}))

describe('test send mail', () => {
  let server

  beforeEach(done => {
    server = buildSmtpServer(smtpOptions.port, done)
  })

  afterEach(done => {
    server.close(done)
  })

  it('test send mails', done => {
    let countMailsRcpt = 0
    server.onData = function (stream, session, callback) {
      const chunks = []
      // let callCallback = true
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', function () {
        var body = Buffer.concat(chunks)
        expect(body.toString()).toMatch(/<html> Test [0-9]{1,2} <\/html>/)
        countMailsRcpt++

        return callback()
      })
    }

    for (let i = 0; i < 10; i++) {
      addMailToSend(`test${i}@email.com`, {
        subject: `test ${i}`,
        content: `<html> Test ${i} </html>`,
      })
    }

    sendMails(args => {
      expect(countMailsRcpt).toBe(10)
    }).then(() => {
      done()
    })
  })

  it('test send mail', async () => {
    server.onData = function (stream, session, callback) {
      const chunks = []
      // let callCallback = true
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', function () {
        var body = Buffer.concat(chunks)
        try {
          expect(body.toString()).toMatch('<html> Test Transport </html>')
        } finally {
          callback()
        }
      })
    }

    await sendMail('test@email.com', {
      subject: 'test',
      content: '<html> Test Transport </html>',
    })
  })

  it('should send one mail to many e-mails', async () => {
    const eMails = ['test@email.com', 'test1@email.com']
    server.onData = function (stream, session, callback) {
      const chunks = []
      // let callCallback = true
      stream.on('data', function (chunk) {
        chunks.push(chunk)
      })
      stream.on('end', function () {
        var body = Buffer.concat(chunks)
        try {
          expect(body.toString()).toMatch('<html> Test Transport </html>')
        } finally {
          callback()
        }
      })
    }

    server.onRcptTo = function (address, session, callback) {
      try {
        expect(eMails).toContain(address.address)
      } finally {
        callback()
      }
    }

    await sendMail(eMails, {
      subject: 'test',
      content: '<html> Test Transport </html>',
    })
  })
})
