import request from 'supertest'
import express from 'express'

import { getMe } from './admin.controllers'
import { createUser } from '../../models/user'

const { connect, disconnect } = require('../../mongo-connection')
const { apiPrefix } = require('../../app')

let app
let admin

const email = 'test@example.com'
const password = 'S3cr3757uff!'

describe('Admin controller', () => {
  beforeAll(async () => {
    await connect()
    admin = await createUser(email, password)
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      req.user = admin
      next()
    })
    app.use(getMe)
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  it('Should response 200 with user infos', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/me`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body).toHaveProperty('email', email)
  })
})
