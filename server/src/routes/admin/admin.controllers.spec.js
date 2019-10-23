import request from 'supertest'
import express from 'express'

import bodyParser from 'body-parser'

import {
  getMe,
  createUserByAdmin,
  deleteUserByAdmin,
} from './admin.controllers'
import { createUser } from '../../models/user'
import config from '../../config'

const { connect, disconnect } = require('../../mongo-connection')
const { apiPrefix } = require('../../app')

let app
let admin
let adminTech

const email = 'test@example.com'
const emailTech = 'testTech@example.com'
const emaildelegue = 'delegue@example.com'
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

describe('Create user', () => {
  let app
  let admin
  let delegue

  beforeAll(async () => {
    await connect()
    admin = await createUser(
      email,
      password,
      departements,
      config.userStatuses.ADMIN
    )
    delegue = await createUser(
      emaildelegue,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  xit('Should respond 201 create user by delegue', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserByAdmin)

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/users`)
      .send({
        email,
        departements,
        password,
        status: config.userStatuses.REPARTITEUR,
      })
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })

  xit('Sould repond 201 create user by admin', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserByAdmin)

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/users`)
      .send({
        email,
        departements,
        password,
        status: config.userStatuses.DELEGUE,
      })
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})

describe(' Delete user by Delegue', () => {
  let app
  let delegue

  beforeAll(async () => {
    await connect()
    admin = await createUser(
      email,
      password,
      departements,
      config.userStatuses.ADMIN
    )
    delegue = await createUser(
      emaildelegue,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  it('Should respond 200 delete user by delegue', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.delete(`${apiPrefix}/admin/users`, deleteUserByAdmin)

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/users`)
      .send({ email, status: config.userStatuses.REPARTITEUR })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})

describe(' Delete user by Admin', () => {
  let app
  let admin

  beforeAll(async () => {
    await connect()
    admin = await createUser(
      email,
      password,
      departements,
      config.userStatuses.ADMIN
    )
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  it('Should respond 200 delete user by admin', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.delete(`${apiPrefix}/admin/users`, deleteUserByAdmin)

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/users`)
      .send({ email, status: config.userStatuses.DELEGUE })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})
