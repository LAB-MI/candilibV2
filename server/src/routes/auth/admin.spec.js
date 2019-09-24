import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { resetMyPassword } from './admin.controllers'
import { updateUserPassword } from '../../models/user'

const { connect, disconnect } = require('../../mongo-connection')
const { default: app, apiPrefix } = require('../../app')
const {
  createUser,
  deleteUserByEmail,
  addEmailValidationHash,
} = require('../../models/user')
const { requestPasswdReset } = require('./admin.controllers')

jest.mock('../business/send-mail')

const email = 'dontusethiseither@example.com'
const password = 'Abcdefgh1*'
const validUser = {
  email,
  password,
}
const invalidUser = {
  email: 'unexisting@example.com',
  password: 'foo',
}

describe('Test the auth admin', () => {
  beforeAll(async () => {
    await connect()
    await createUser(email, password)
  })

  afterAll(async () => {
    await deleteUserByEmail(email)
    await disconnect()
    await app.close()
  })

  it('Should response the POST method with a 401 for an unknown user', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/auth/admin/token`)
      .send(invalidUser)
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
  })

  it('Should response the POST method with a 401 for a known user with wrong password', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/auth/admin/token`)
      .send({ email, password: 'foo' })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
  })

  it('Should response the POST method with a 201 for a known user', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/auth/admin/token`)
      .send(validUser)
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
  })
})

describe('Email on call to /reset-link', () => {
  const validEmail = 'email@email.fr'
  const password = 'S3cr3757uff!'

  let user
  let app
  beforeAll(async () => {
    app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.post('/reset-link', requestPasswdReset)
    await connect()
    user = await createUser(validEmail, password)
  })

  afterAll(async () => {
    await deleteUserByEmail(email)
    await disconnect()
    await app.close()
  })

  it('Should not validate email ', async () => {
    const email = 'email@emai.fr'
    const { body } = await request(app)
      .post('/reset-link')
      .send(email)
      .set('Accept', 'application/json')
      .expect(401)
    expect(body).toHaveProperty('success', false)
  })

  it('Should validate email', async () => {
    const { body } = await request(app)
      .post('/reset-link')
      .send(user)
      .set('Accept', 'application/json')
      .expect(200)
    expect(body).toHaveProperty('success', true)
  })
})

describe('Reset my password', () => {
  const validEmail = 'email@example.com'
  const password = '@E3fd8po'
  const newPassword = 'Psr@85df'
  let emailValidationHash

  let user
  let app
  beforeAll(async () => {
    app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.patch('/admin/me', resetMyPassword)
    try {
      await connect()
      user = await createUser(validEmail, password)
      emailValidationHash = await addEmailValidationHash(validEmail)
      await updateUserPassword(user, newPassword)
    } catch (error) {
      console.error(error)
    }
  })

  afterAll(async () => {
    await deleteUserByEmail(email)
    await disconnect()
    app.close()
  })

  it('Should not validate password change when password dont match', async () => {
    const newPassword = 'Psr@85ef'
    const confirmNewPassword = 'Psr@85df'
    const { body } = await request(app)
      .patch('/admin/me')
      .send({
        newPassword,
        confirmNewPassword,
        email: validEmail,
        emailValidationHash,
      })
      .set('Accept', 'application/json')
      .expect(400)
    expect(body).toHaveProperty('success', false)
  })

  it('Should not validate password change when emailValidationHash is absent', async () => {
    const newPassword = 'Psr@85df'
    const confirmNewPassword = 'Psr@85df'
    const { body } = await request(app)
      .patch('/admin/me')
      .send({
        newPassword,
        confirmNewPassword,
        email: validEmail,
      })
      .set('Accept', 'application/json')
      .expect(401)
    expect(body).toHaveProperty('success', false)
  })

  it('Should validate password change', async () => {
    const newPassword = 'Psr@85df'
    const confirmNewPassword = 'Psr@85df'
    const { body } = await request(app)
      .patch('/admin/me')
      .send({
        newPassword,
        confirmNewPassword,
        email: validEmail,
        emailValidationHash,
      })
      .set('Accept', 'application/json')
      .expect(200)
    expect(body).toHaveProperty('success', true)
  })
})
