import request from 'supertest'
import { getFrenchLuxon } from '../../util'

const { connect, disconnect } = require('../../mongo-connection')
const {
  createCandidats,
  makeResas,
  createPlaces,
  deleteCandidats,
  removePlaces,
  candidats,
  createCentres,
  removeCentres,
} = require('../../models/__tests__')

const { default: app, apiPrefix } = require('../../app')

jest.mock('./middlewares/verify-user-level')
jest.mock('../middlewares/verify-token')

const bookedAt = getFrenchLuxon().toJSDate()

xdescribe('Test get and export candidats', () => {
  beforeAll(async () => {
    await connect()
    await createCandidats()
    await createCentres()
    await createPlaces()
    await makeResas(bookedAt)
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
    await app.close()
  })

  it('Should response 200 with list candidats', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/candidats?departement=93`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body.length).toBe(candidats.length)
  })
  it('Should response 200 with list candidats in a file', async () => {
    const { text } = await request(app)
      .get(`${apiPrefix}/admin/candidats?format=csv&departement=93`)
      .expect('Content-Type', 'text/csv; charset=utf-8')
      .expect(
        'Content-Disposition',
        'attachment; filename="candidatsLibresPrintel.csv"'
      )
      .expect(200)

    expect(text).not.toBe(expect.anything())
    expect(text.split('\n').length).toBe(candidats.length + 1)
  })
})
