import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'

import {
  createCandidats,
  setInitCreatedCentre,
  resetCreatedInspecteurs,
} from '../../models/__tests__'
import {
  centreDateDisplay01,
  createPlacesWithCreatedAtDiff,
} from '../../models/__tests__/places.date.display'

import {
  setHoursMinutesSeconds,
  setNowAtNow,
} from '../candidat/__tests__/luxon-time-setting'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')

describe('Get centres with the numbers places available in departements and display when delay expired', () => {
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()

    await connect()
    const createdCandidats = await createCandidats()
    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id,
    )

    await createPlacesWithCreatedAtDiff()
  })

  afterAll(async () => {
    await disconnect()
    setNowAtNow()
  })

  it('Should response 200 to find 2 centres with one place from departement 75 delays is left', async () => {
    setHoursMinutesSeconds(14, 0, 1)

    const departement = centreDateDisplay01.geoDepartement
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    const centre = body.find(
      ({ centre: { _id } }) =>
        _id.toString() === centreDateDisplay01._id.toString(),
    )
    expect(centre).toHaveProperty('count', 1)
  })
  it('Should response 200 to find 2 centres whit 3 places from departement 75 when delay is left', async () => {
    setHoursMinutesSeconds(16, 0, 1)

    const departement = centreDateDisplay01.geoDepartement
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    const centre = body.find(
      ({ centre: { _id } }) =>
        _id.toString() === centreDateDisplay01._id.toString(),
    )
    expect(centre).toHaveProperty('count', 3)
  })
})
