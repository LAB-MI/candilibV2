import request from 'supertest'
import { connect, disconnect } from '../../mongo-connection'

import { createUser, deleteUser, findUserByEmail } from '../../models/user'
import config from '../../config'

import {
  BAD_PARAMS,
  INVALID_DEPARTEMENT_EMAIL,
  INVALID_DEPARTEMENT_NUMBER,
} from './message.constants'

const emailAdmin = 'Admin@example.com'
const password = 'S3cr3757uff!'
const departements = ['75', '93']

const {
  createDepartementTest,
  createManyDepartementTest,
  deleteDepartementTest,
  deleteManyDepartementsTest,
} = require('../../models/__tests__')

const { default: app, apiPrefix } = require('../../app')

jest.mock('./middlewares/verify-user-level')
jest.mock('../middlewares/verify-token')

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const departementId00 = '44'
const departementId01 = '30'
const departementEmail01 = 'emaildu30@mail.com'

const departementId02 = '31'
const departementEmail02 = 'emaildu31@mail.com'

const departementList = [
  {
    _id: '35',
    email: 'emailDu35@mail.com',
  },
  {
    _id: '36',
    email: 'emaildu36@mail.com',
  },
  {
    _id: '37',
    email: 'emaildu37@mail.com',
  },
]

const newEmail = 'newemaildu37@test.com'

describe('Département controllers', () => {
  beforeAll(async () => {
    await connect()
    await createManyDepartementTest(departementList)
    await createUser(
      emailAdmin,
      password,
      departements,
      config.userStatuses.ADMIN,
    )
  })

  afterAll(async () => {
    await deleteManyDepartementsTest(departementList)
    await disconnect()
  })

  it('Should create one departement', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/admin/departements`)
      .send({
        departementId: departementId01,
        departementEmail: departementEmail01,
      })
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty(
      'message',
      `Le département ${departementId01} a bien été créé avec l'adresse courriel ${departementEmail01}`,
    )
    const expected = [...departements, departementId01]
    const userInfo = await findUserByEmail(emailAdmin, true)
    expect(userInfo.departements).toEqual(expect.arrayContaining(expected))
    await deleteUser(userInfo)
    await deleteDepartementTest(departementId01)
  })

  it('Should delete one departement', async () => {
    await createDepartementTest(departementId02, departementEmail02)

    const message = `Le département ${departementId02} a bien été supprimé`

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/departements/${departementId02}`)
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', message)
  })

  it('Should not delete one departement and to be 400', async () => {
    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/departements`)
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', BAD_PARAMS)
  })

  it('Should not create one departement with invalid departement number', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/admin/departements`)
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INVALID_DEPARTEMENT_NUMBER)
  })

  it('Should not create one departement with invalid departement email', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/admin/departements`)
      .send({
        departementId: departementId00,
      })
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', INVALID_DEPARTEMENT_EMAIL)
  })

  it('Should get departement', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/departements/${departementList[0]._id}`)
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body.result).toHaveLength(1)
    expect(body.result[0]).toHaveProperty('_id', departementList[0]._id)
    expect(body.result[0]).toHaveProperty('email', departementList[0].email)
  })

  it('Should get a list of departement', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/departements`)
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('result')
    expect(body.result).toBeDefined()
    expect(body.result).toHaveLength(departementList.length)
    expect(body.result.map(el => ({ _id: el._id, email: el.email }))).toEqual(
      expect.arrayContaining(departementList),
    )
  })

  it('Should update one departement', async () => {
    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/departements/${departementList[2]._id}`)
      .send({ newEmail })
      .expect(200)

    expect(body.result).toHaveProperty('_id', departementList[2]._id)
    expect(body.result).toHaveProperty('email', newEmail)
  })

  it('Should not update one departement', async () => {
    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/departements`)
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', BAD_PARAMS)
  })
})
