import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'

import {
  createCandidats,
  setInitCreatedCentre,
  resetCreatedInspecteurs,
} from '../../models/__tests__'
import {
  centreDateDisplay,
  createPlacesWithCreatedAtDiff,
} from '../../models/__tests__/places.date.display'
import { Settings } from 'luxon'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')

describe('Get centres with the numbers places available in departements and display at 12h', () => {
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()

    await connect()
    const createdCandidats = await createCandidats()
    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id
    )

    await createPlacesWithCreatedAtDiff()
  })

  afterAll(async () => {
    await disconnect()
    Settings.now = () => Date.now
  })

  it('Should response 200 to find 2 centres from departement 75', async () => {
    Settings.now = () => new Date().setHours(11, 59, 59).valueOf()

    const departement = centreDateDisplay.geoDepartement
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    const centre = body.find(
      ({ centre: { _id } }) =>
        _id.toString() === centreDateDisplay._id.toString()
    )
    expect(centre).toHaveProperty('count', 1)
  })
  it('Should response 200 to find 2 centres from departement 75', async () => {
    Settings.now = () => new Date().setHours(12, 0, 0).valueOf()

    const departement = centreDateDisplay.geoDepartement
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    const centre = body.find(
      ({ centre: { _id } }) =>
        _id.toString() === centreDateDisplay._id.toString()
    )
    expect(centre).toHaveProperty('count', 3)
  })
})
