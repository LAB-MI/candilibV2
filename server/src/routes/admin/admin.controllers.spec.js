import request from 'supertest'
import express from 'express'

import bodyParser from 'body-parser'

import {
  getMe,
  archiveUserController,
  updatedInfoUser,
  createUserController,
  getUsers,
} from './admin.controllers'
import { createUser } from '../../models/user'
import config from '../../config'
import {
  CANNOT_ACTION_USER,
  INCORRECT_DEPARTEMENT_LIST,
  INVALID_EMAIL,
} from './message.constants'

jest.mock('../business/send-mail')

const { connect, disconnect } = require('../../mongo-connection')
const { apiPrefix } = require('../../app')

const email = 'test@example.com'
const emailAdmin = 'Admin@example.com'
const emailTech = 'testTech@example.com'
const emailDelegue = 'delegue@example.com'
const emailInvalid = 'emailInvalidexample.com'
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

  it('Should respond 201 create "répartiteur" by "délégué"', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserController)

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/users`)
      .send({
        email,
        password,
        departements,
        status: config.userStatuses.REPARTITEUR,
      })
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })

  it('Should respond 201 create "délégué" by "admin"', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserController)

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

  it('Should respond 400 if email is not valid', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserController)

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/users`)
      .send({
        emailInvalid,
        departements,
        password,
        status: config.userStatuses.DELEGUE,
      })
      .set('Accept', 'application/json')
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INVALID_EMAIL)
  })

  it('Should respond 401 if "délégué" tries to create "délégué"', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserController)

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/users`)
      .send({
        email,
        departements,
        password,
        status: config.userStatuses.DELEGUE,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', CANNOT_ACTION_USER)
  })

  it('Should respond 401 if "Admin" tries to create "Admin"', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserController)

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/users`)
      .send({
        email,
        departements,
        password,
        status: config.userStatuses.ADMIN,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', CANNOT_ACTION_USER)
  })

  it('Should respond 401 if départements of "répartiteur" to create are not in the "délégué" départements list', async () => {
    const otherDepartements = ['94']
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.post(`${apiPrefix}/admin/users`, createUserController)

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/users`)
      .send({
        email,
        otherDepartements,
        password,
        status: config.userStatuses.REPARTITEUR,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INCORRECT_DEPARTEMENT_LIST)
  })
})

describe('Get users', () => {
  let app
  let admin
  let delegue
  let repartiteur

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
    repartiteur = await createUser(
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

  it('Should respond 200 retrieve users by admin', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = admin._id
      next()
    })

    app.use(`${apiPrefix}/admin/users`, getUsers)

    const { body } = await request(app)
      .get(`${apiPrefix}/admin/users`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('users')
    expect(body.users).toBeInstanceOf(Array)
  })

  it('Should respond 401 retrieve users by Delegue', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })

    app.use(`${apiPrefix}/admin/users`, getUsers)

    const { body } = await request(app)
      .get(`${apiPrefix}/admin/users`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
  })

  it('Should respond 401 retrieve users by repartiteur', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = repartiteur._id
      next()
    })

    app.use(`${apiPrefix}/admin/users`, getUsers)

    const { body } = await request(app)
      .get(`${apiPrefix}/admin/users`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty(
      'message',
      "Vous n'êtes pas autorisé à effectuer une action sur ce type d'utilisateur"
    )
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
      .send({
        email: updateUser.email,
        departements: ['75'],
        status: config.userStatuses.REPARTITEUR,
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })

  it('Should respond 400 if email is not valid', async () => {
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
      .send({
        emailInvalid,
        departements,
        password,
        status: config.userStatuses.DELEGUE,
      })
      .set('Accept', 'application/json')
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INVALID_EMAIL)
  })
  it('Should respond 401 if "Admin" tries to update "Admin"', async () => {
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
      .send({
        email,
        departements,
        password,
        status: config.userStatuses.ADMIN,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', CANNOT_ACTION_USER)
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
      .send({
        email: updateUser.email,
        departements: ['75'],
        status: config.userStatuses.REPARTITEUR,
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
  it('Should respond 401 if "délégué" tries to update "délégué"', async () => {
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
      .send({
        email,
        departements,
        password,
        status: config.userStatuses.DELEGUE,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', CANNOT_ACTION_USER)
  })
  it('Should respond 401 if départements of "répartiteur" to update are not in the "délégué" départements list', async () => {
    const otherDepartements = ['94']
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
      .send({
        email,
        otherDepartements,
        password,
        status: config.userStatuses.REPARTITEUR,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INCORRECT_DEPARTEMENT_LIST)
  })
})

describe(' Delete user by delegue', () => {
  let app
  let delegue
  let userToDelete
  const otherDepartements = ['94']
  const emailDelegueToDelete = 'delegueToDelete@example.com'
  const emailDelegueToDelete2 = 'repartToDelete2@example.com'

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
    await createUser(
      emailDelegueToDelete,
      password,
      departements,
      config.userStatuses.DELEGUE
    )
    await createUser(
      emailDelegueToDelete2,
      password,
      otherDepartements,
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

    app.delete(`${apiPrefix}/admin/users`, archiveUserController)

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/users`)
      .send({ email: userToDelete.email })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
  it('Should respond 400 if user is not exist', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.delete(`${apiPrefix}/admin/users`, archiveUserController)

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/users`)
      .send({})
      .set('Accept', 'application/json')
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INVALID_EMAIL)
  })

  it('Should respond 401 if "délégué" tries to delete "délégué"', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.delete(`${apiPrefix}/admin/users`, archiveUserController)

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/users`)
      .send({
        email: emailDelegueToDelete,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', CANNOT_ACTION_USER)
  })

  it('Should respond 401 if départements of "répartiteur" to delete are not in the "délégué" départements list', async () => {
    app = express()
    app.use((req, res, next) => {
      req.userId = delegue._id
      next()
    })
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

    app.delete(`${apiPrefix}/admin/users`, archiveUserController)

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/users`)
      .send({
        email: emailDelegueToDelete2,
      })
      .set('Accept', 'application/json')
      .expect(401)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INCORRECT_DEPARTEMENT_LIST)
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

    app.delete(`${apiPrefix}/admin/users`, archiveUserController)

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/users`)
      .send({ email: userToDelete.email })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message')
  })
})
