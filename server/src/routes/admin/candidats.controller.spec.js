const request = require('supertest')

const { connect, disconnect } = require('../../mongo-connection')
const {
  createCandidats,
  makeResas,
  createPlaces,
  deleteCandidats,
  deletePlaces,
  candidats,
  NUMBER_RESA,
} = require('../../models/candidat/__TESTS__/candidats')

const { default: app, apiPrefix } = require('../../app')

jest.mock('./middlewares/verify-admin-level')
jest.mock('../middlewares/verify-token')

describe('Test get and export candidats', () => {
  beforeAll(async () => {
    await connect()
    await createCandidats()
    await createPlaces()
    await makeResas()
  })

  afterAll(async () => {
    await deletePlaces()
    await deleteCandidats()
    await disconnect()
    await app.close()
  })

  it('Should response 200 with list candidats', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/admin/candidats`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body.length).toBe(candidats.length)
  })
  it('Should response 200 with list candidats in a file', async () => {
    const { text } = await request(app)
      .get(`${apiPrefix}/admin/candidats?format=csv`)
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
      .get(`${apiPrefix}/admin/candidats?filter=resa`)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    expect(body.length).toBe(NUMBER_RESA)
  })
  it('Should response 200 with list booked candidats in a file', async () => {
    const { text } = await request(app)
      .get(`${apiPrefix}/admin/candidats?format=csv&filter=resa`)
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
