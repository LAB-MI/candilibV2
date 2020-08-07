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
import candidatModel, { createConnectionCandidatModel, CandidatModelConnection } from '../../models/candidat/candidat.model'
import PlaceModel from '../../models/place/place.model'
jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')
jest.mock('../../util/token')

require('../../util/logger').setWithConsole(true)

describe('Test get dates from places available', () => {
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()

    await connect()
    await createConnectionCandidatModel()
    const createdCandidats = await createCandidats()
    await createCentres()
    const places = await createPlaces()

    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id,
    )
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
    CandidatModelConnection.close()
    await app.close()
  })

  it('should have two geoDepartements, 93 with 1 centre / 1 place and 75 with 2 centres / 6 places', async () => {
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
    // expect(geoDepartementInfo93).toHaveProperty('centres')
    expect(geoDepartementInfo93).toHaveProperty('count', 1)
    // expect(geoDepartementInfo93.centres).toHaveLength(1)
    // expect(geoDepartementInfo93.centres[0]).toHaveProperty('centre')
    // expect(geoDepartementInfo93.centres[0].centre).toHaveProperty(
    //   'geoDepartement',
    //   '93',
    // )
    // expect(geoDepartementInfo93.centres[0].centre).toHaveProperty(
    //   'nom',
    //   'CENTRE 1',
    // )
    // expect(geoDepartementInfo93.centres[0]).toHaveProperty('count', 1)

    const nbPlacesForCentre2 = 3
    const nbPlacesForCentre3 = 3
    expect(geoDepartementInfo75).toBeDefined()
    // expect(geoDepartementInfo75).toHaveProperty('centres')
    expect(geoDepartementInfo75).toHaveProperty(
      'count',
      nbPlacesForCentre2 + nbPlacesForCentre3,
    )
    // expect(geoDepartementInfo75.centres).toHaveLength(2)

    // const centreInfos2 = geoDepartementInfo75.centres.find(
    //   el => el.centre.nom === 'CENTRE 2',
    // )
    // const centreInfos3 = geoDepartementInfo75.centres.find(
    //   el => el.centre.nom === 'CENTRE 3',
    // )

    // expect(centreInfos2).toHaveProperty('centre')
    // expect(centreInfos2.centre).toHaveProperty('geoDepartement', '75')
    // expect(centreInfos2).toHaveProperty('count', nbPlacesForCentre2)

    // expect(centreInfos3).toHaveProperty('centre')
    // expect(centreInfos3.centre).toHaveProperty('geoDepartement', '75')
    // expect(centreInfos3).toHaveProperty('count', nbPlacesForCentre3)
  })

  it('should have two geoDepartements, 93 with 1 centre / 0 place and 75 with 2 centres / 0 places', async () => {
    await removePlaces()

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
    // expect(geoDepartementInfo93).toHaveProperty('centres')
    expect(geoDepartementInfo93).toHaveProperty('count', 0)
    // expect(geoDepartementInfo93.centres).toHaveLength(1)
    // expect(geoDepartementInfo93.centres[0]).toHaveProperty('centre')
    // expect(geoDepartementInfo93.centres[0].centre).toHaveProperty(
    //   'geoDepartement',
    //   '93',
    // )
    // expect(geoDepartementInfo93.centres[0].centre).toHaveProperty(
    //   'nom',
    //   'CENTRE 1',
    // )
    // expect(geoDepartementInfo93.centres[0]).toHaveProperty('count', 0)

    expect(geoDepartementInfo75).toBeDefined()
    // expect(geoDepartementInfo75).toHaveProperty('centres')
    expect(geoDepartementInfo75).toHaveProperty('count', 0)
    // expect(geoDepartementInfo75.centres).toHaveLength(2)

    // const centreInfos2 = geoDepartementInfo75.centres.find(
    //   el => el.centre.nom === 'CENTRE 2',
    // )
    // const centreInfos3 = geoDepartementInfo75.centres.find(
    //   el => el.centre.nom === 'CENTRE 3',
    // )

    // expect(centreInfos2).toHaveProperty('centre')
    // expect(centreInfos2.centre).toHaveProperty('geoDepartement', '75')
    // expect(centreInfos2).toHaveProperty('count', 0)

    // expect(centreInfos3).toHaveProperty('centre')
    // expect(centreInfos3.centre).toHaveProperty('geoDepartement', '75')
    // expect(centreInfos3).toHaveProperty('count', 0)
  })
})
