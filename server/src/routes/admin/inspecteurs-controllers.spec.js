import request from 'supertest'

import app, { apiPrefix } from '../../app'
import config from '../../config'
import Inspecteur from '../../models/inspecteur/inspecteur-model'
import { createUser } from '../../models/user'
import { connect, disconnect } from '../../mongo-connection'

jest.mock('./middlewares/verify-user-level')
jest.mock('../middlewares/verify-token')
jest.mock('../business/send-mail')
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

// user
const emailAdmin = 'Admin@example.com'
const password = 'S3cr3757uff!'
const departements = ['75', '93']

// inspecteur
const validEmail = 'dontusethis@example.fr'
const anotherValidEmail = 'dontusethis@example.com'

const email = validEmail
const matricule = '153424'
const nom = 'Dupont'
const prenom = 'Jacques'

describe('inspecteurs controllers', () => {
  beforeAll(async () => {
    await connect()
    const userCreated = await createUser(
      emailAdmin,
      password,
      departements,
      config.userStatuses.ADMIN,
    )
    require('../middlewares/verify-token').__setIdAdmin(
      userCreated._id,
      userCreated.departements,
    )
  })

  afterEach(async () => {
    await Inspecteur.deleteOne({ matricule })
  })

  afterAll(async () => {
    await disconnect()
  })

  it('Should add new inspecteur', async () => {
    const bodyToSend = {
      departement: '93',
      email,
      matricule,
      nom,
      prenom,
    }

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/inspecteurs`)
      .send(bodyToSend)
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
    expect(body.ipcsr).toBeDefined()
    const { ipcsr } = body
    expect(ipcsr).toHaveProperty('nom', nom.toUpperCase())
    expect(ipcsr).toHaveProperty('prenom', prenom)
    expect(ipcsr).toHaveProperty('matricule', matricule)
    expect(ipcsr).toHaveProperty('email', email)
    expect(ipcsr).toHaveProperty('secondEmail', [])
  })

  it('Should add new inspecteur with second', async () => {
    const bodyToSend = {
      departement: '93',
      email,
      matricule,
      nom,
      prenom,
      secondEmail: [anotherValidEmail],
    }

    const { body } = await request(app)
      .post(`${apiPrefix}/admin/inspecteurs`)
      .send(bodyToSend)
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toHaveProperty('success', true)
    expect(body.ipcsr).toBeDefined()
    const { ipcsr } = body
    expect(ipcsr).toHaveProperty('nom', nom.toUpperCase())
    expect(ipcsr).toHaveProperty('prenom', prenom)
    expect(ipcsr).toHaveProperty('matricule', matricule)
    expect(ipcsr).toHaveProperty('email', email)
    expect(ipcsr).toHaveProperty('secondEmail', [anotherValidEmail])
  })
})
