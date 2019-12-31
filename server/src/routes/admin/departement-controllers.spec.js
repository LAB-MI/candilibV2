import request from 'supertest'
import { connect, disconnect } from '../../mongo-connection'
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

describe('Name of the group', () => {
  beforeAll(async () => {
    await connect()
    await createManyDepartementTest(departementList)
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
      `Le département ${departementId01} a bien été crée avec l'adresse courriel ${departementEmail01}`
    )
    await deleteDepartementTest(departementId01)
  })

  it('Should delete one departement', async () => {
    await createDepartementTest(departementId02, departementEmail02)

    const message = `Le département ${departementId02} a bien été supprimé`

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/departements/?id=${departementId02}`)
      .expect(200)

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', message)
  })

  it('Should not delete one departement and to be 400', async () => {
    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/departements`)
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Paramètre saisie invalide')
  })

  it('Should not create one departement', async () => {
    const { body } = await request(app)
      .post(`${apiPrefix}/admin/departements`)
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty(
      'message',
      'Numéro de département non renséigné'
    )
  })

  it('Should get departement', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/departements/${departementList[0]._id}`)
      .expect(200)

    expect(body).toHaveProperty('success', true)
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
  })

  it('Should update one departement', async () => {
    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/departements`)
      .send({ departementId: departementList[2]._id, newEmail })
      .expect(200)

    expect(body.result).toHaveProperty('_id', departementList[2]._id)
    expect(body.result).toHaveProperty('email', newEmail)
  })

  it('Should not update one departement', async () => {
    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/departements`)
      .expect(400)

    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Paramètre saisie invalide')
  })
})
