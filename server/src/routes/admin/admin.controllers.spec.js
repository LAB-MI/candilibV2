import request from 'supertest'
import express from 'express'

import { getMe } from './admin.controllers'
import { createUser } from '../../models/user'
import config from '../../config'

const { connect, disconnect } = require('../../mongo-connection')
const { apiPrefix } = require('../../app')

let app
let admin
let adminTech

const email = 'test@example.com'
const emailTech = 'testTech@example.com'

const password = 'S3cr3757uff!'

const departements = ['75', '93']

describe('Admin controller', () => {
  beforeAll(async () => {
    await connect()
    admin = await createUser(email, password, departements)
    adminTech = await createUser(
      emailTech,
      password,
      departements,
      config.userStatuses.TECH
    )
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  it('Should response 200 with user admin infos', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })
    app.use(getMe)

    const { body } = await request(app)
      .get(`${apiPrefix}/admin/me`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body).toHaveProperty('email', email)
    expect(body.departements).toHaveLength(departements.length)
    expect(body).toHaveProperty(
      'features',
      config.userStatusFeatures[config.userStatuses.ADMIN]
    )
  })

  it('Should response 200 with user tech infos', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = adminTech._id
      next()
    })
    app.use(getMe)

    const { body } = await request(app)
      .get(`${apiPrefix}/admin/me`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body).toHaveProperty('email', emailTech)
    expect(body.departements).toHaveLength(departements.length)
    expect(body).toHaveProperty(
      'features',
      config.userStatusFeatures[config.userStatuses.TECH]
    )
  })
})
