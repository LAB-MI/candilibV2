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

describe('Get departement with the numbers places available in departements and display at 12h', () => {
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

  it('Should get 1 place for 75 when now is before 12h', async () => {
    Settings.now = () => new Date().setHours(11, 59, 59).valueOf()

    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/departements`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('geoDepartementsInfos')

    const { geoDepartementsInfos } = body

    expect(geoDepartementsInfos).toHaveLength(2)

    expect(
      geoDepartementsInfos.find(
        ({ geoDepartement }) =>
          geoDepartement === centreDateDisplay.geoDepartement
      )
    ).toHaveProperty('count', 1)
  })
  it('Should get 3 places for 75 when now is after 12h', async () => {
    Settings.now = () => new Date().setHours(12, 0, 0).valueOf()

    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/departements`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('geoDepartementsInfos')

    const { geoDepartementsInfos } = body

    expect(geoDepartementsInfos).toHaveLength(2)

    expect(
      geoDepartementsInfos.find(
        ({ geoDepartement }) =>
          geoDepartement === centreDateDisplay.geoDepartement
      )
    ).toHaveProperty('count', 3)
  })
})
