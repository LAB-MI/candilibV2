import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import {
  createCandidats,
  createCentres,
  createPlaces,
  deleteCandidats,
  removeCentres,
  removePlaces,
  setInitCreatedCentre,
  resetCreatedInspecteurs,
  setInitCreatedPlaces,
} from '../../models/__tests__'

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')
jest.mock('../../util/token')

require('../../util/logger').setWithConsole(false)

describe('Test get dates from places available', () => {
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()

    await connect()
    const createdCandidats = await createCandidats()
    await createCentres()
    await createPlaces()
    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id,
    )
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
    await app.close()
  })

  it('should have two geoDepartements, 93 and 75', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/departements`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('geoDepartementsInfos')

    const { geoDepartementsInfos } = body

    expect(geoDepartementsInfos).toHaveLength(2)

    const geoDepartementInfo93 = body.geoDepartementsInfos.find(
      el => el.geoDepartement === '93',
    )
    const geoDepartementInfo75 = body.geoDepartementsInfos.find(
      el => el.geoDepartement === '75',
    )
    expect(geoDepartementInfo93).toBeDefined()
    expect(geoDepartementInfo93).toHaveProperty('centres')
    expect(geoDepartementInfo93).toHaveProperty('count', null)

    expect(geoDepartementInfo75).toBeDefined()
    expect(geoDepartementInfo75).toHaveProperty('centres')
    expect(geoDepartementInfo75).toHaveProperty(
      'count',
      null,
    )
  })
})
