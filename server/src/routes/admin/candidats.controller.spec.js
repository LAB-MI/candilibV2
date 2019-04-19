import request from 'supertest'

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
  NUMBER_RESA,
} = require('../../models/__tests__')

const { default: app, apiPrefix } = require('../../app')

jest.mock('./middlewares/verify-admin-level')
jest.mock('../middlewares/verify-token')

describe('Test get and export candidats', () => {
  beforeAll(async () => {
    await connect()
    await createCandidats()
    await createCentres()
    await createPlaces()
    await makeResas()
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
  it('Should response 200 with list booked candidats', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/candidats?filter=resa&departement=93`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body.length).toBe(NUMBER_RESA)
  })
  it('Should response 200 with list booked candidats in a file', async () => {
    const { text } = await request(app)
      .get(`${apiPrefix}/admin/candidats?format=csv&filter=resa&departement=93`)
      .expect('Content-Type', 'text/csv; charset=utf-8')
      .expect(
        'Content-Disposition',
        'attachment; filename="candidatsLibresReserve.csv"'
      )
      .expect(200)
    expect(text).not.toBe(expect.anything())
    expect(text.split('\n').length).toBe(NUMBER_RESA + 1)
  })
})
