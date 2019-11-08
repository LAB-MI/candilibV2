import request from 'supertest'
import express from 'express'

import bodyParser from 'body-parser'

import {
  getMe,
  createUserByAdmin,
  deleteUserByAdmin,
  updatedInfoUser,
} from './admin.controllers'
import { createUser } from '../../models/user'
import config from '../../config'

jest.mock('../business/send-mail')

const { connect, disconnect } = require('../../mongo-connection')
const { apiPrefix } = require('../../app')

const email = 'test@example.com'
const emailAdmin = 'Admin@example.com'
const emailTech = 'testTech@example.com'
const emailDelegue = 'delegue@example.com'
const password = 'S3cr3757uff!'

const departements = ['75', '93']

describe('Admin controller', () => {
  let app
  let admin
  let adminTech

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
      emailAdmin,
      password,
      departements,
      config.userStatuses.ADMIN
    )
    delegue = await createUser(
      emailDelegue,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  it('Should respond 201 create user by delegue', async () => {
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
        status: config.userStatuses.REPARTITEUR,
      })
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })

  it('Sould repond 201 create user by admin', async () => {
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

describe('Update User by admin', () => {
  let app
  let admin
  let updateUser

  beforeAll(async () => {
    await connect()
    admin = await createUser(
      emailAdmin,
      password,
      departements,
      config.userStatuses.ADMIN
    )
    updateUser = await createUser(
      email,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
  })
  afterAll(async () => {
    await disconnect()
    app.close()
  })
  it('Should respond 200 update user by admin', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.put(`${apiPrefix}/admin/users`, updatedInfoUser)
    const { body } = await request(app)
      .put(`${apiPrefix}/admin/users`)
      .send({ email: updateUser.email })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})

describe('Update User by delegue', () => {
  let app
  let delegue
  let updateUser

  beforeAll(async () => {
    await connect()
    delegue = await createUser(
      emailAdmin,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
    updateUser = await createUser(
      email,
      password,
      departements,
      config.userStatuses.REPARTITEUR
    )
  })
  afterAll(async () => {
    await disconnect()
    app.close()
  })
  it('Should respond 200 update user by delegue', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.put(`${apiPrefix}/admin/users`, updatedInfoUser)
    const { body } = await request(app)
      .put(`${apiPrefix}/admin/users`)
      .send({ email: updateUser.email })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})

describe(' Delete user by delegue', () => {
  let app
  let delegue
  let userToDelete

  beforeAll(async () => {
    await connect()
    delegue = await createUser(
      emailDelegue,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
    userToDelete = await createUser(
      email,
      password,
      departements,
      config.userStatuses.REPARTITEUR
    )
  })

  afterAll(async () => {
    await disconnect()
    app.close()
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
      .send({ email: userToDelete.email })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})
describe(' Delete user by admin', () => {
  let app
  let admin
  let userToDelete

  beforeAll(async () => {
    await connect()
    admin = await createUser(
      emailAdmin,
      password,
      departements,
      config.userStatuses.ADMIN
    )
    userToDelete = await createUser(
      email,
      password,
      departements,
      config.userStatuses.DELEGUE
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
      .send({ email: userToDelete.email })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})
