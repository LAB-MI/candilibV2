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
  createPlacesWithVisibleAt,
} from '../../models/__tests__/places.date.display'

import {
  setNowBefore12h,
  setNowAfter12h,
  setNowAtNow,
} from '../candidat/__tests__/luxon-time-setting'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')

xdescribe('Get centres with the numbers places available in departements and display at 12h', () => {
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()

    await connect()
    const createdCandidats = await createCandidats()
    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id,
    )

    await createPlacesWithVisibleAt()
  })

  afterAll(async () => {
    await disconnect()
    setNowAtNow()
  })

  it('Should response 200 to find 2 centres with one place from departement 75 when is before 12h', async () => {
    setNowBefore12h()

    const departement = centreDateDisplay.geoDepartement
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    const centre = body.find(
      ({ centre: { _id } }) =>
        _id.toString() === centreDateDisplay._id.toString(),
    )
    expect(centre).toHaveProperty('count', 1)
  })
  it('Should response 200 to find 2 centres whit 3 places from departement 75 when is after 12h', async () => {
    setNowAfter12h()

    const departement = centreDateDisplay.geoDepartement
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    const centre = body.find(
      ({ centre: { _id } }) =>
        _id.toString() === centreDateDisplay._id.toString(),
    )
    expect(centre).toHaveProperty('count', 3)
  })
})
