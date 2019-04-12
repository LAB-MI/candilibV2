import request from 'supertest'
import express from 'express'

/*
import { verifyToken } from '../middlewares'
import { verifyAdminLevel } from './middlewares/verify-admin-level'
*/

import { apiPrefix } from '../../app'
import { getMe } from './admin.controllers'
import { createUser } from '../../models/user';

const { connect, disconnect } = require('../../mongo-connection')

// jest.mock('./middlewares/verify-admin-level')
// jest.mock('../middlewares/verify-token')

let app
let admin

const email = 'test@example.com'
const password = 'S3cr3757uff!'

// app.use(verifyToken, verifyAdminLevel)


describe('Admin controller', () => {
  beforeAll(async () => {
    await connect()
    admin = await createUser(email, password)
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
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
      .get('')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body).toHaveProperty('email', email)

  })
})
