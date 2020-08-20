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
} from './__tests__/luxon-time-setting'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')

describe('Get departement with the numbers places available in departements and display when delay left', () => {
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

  it('Should get 1 place for 75 when now is 12:00:01', async () => {
    setHoursMinutesSeconds(12, 0, 1)

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
          geoDepartement === centreDateDisplay01.geoDepartement,
      ),
    ).toHaveProperty('count', 1)
  })

  it('Should get 3 places for 75 when now is 15:00:01', async () => {
    setHoursMinutesSeconds(16, 0, 1)
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
          geoDepartement === centreDateDisplay01.geoDepartement,
      ),
    ).toHaveProperty('count', 3)
  })

  it('Should get 0 place for 75 when now is 11:59:59', async () => {
    setHoursMinutesSeconds(11, 59, 59)
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
          geoDepartement === centreDateDisplay01.geoDepartement,
      ),
    ).toHaveProperty('count', 0)
  })
})
