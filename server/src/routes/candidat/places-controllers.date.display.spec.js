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
  createdAtBefore,
} from '../../models/__tests__/places.date.display'
import { Settings } from 'luxon'
import { getFrenchLuxonFromJSDate } from '../../util'
import { findPlaceByCandidatId } from '../../models/place'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')
jest.mock('../business/send-mail')

describe('Get places available and display at 12h', () => {
  let places
  let placesCreatedBefore
  let idCandidat
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()

    await connect()
    const createdCandidats = await createCandidats()
    idCandidat = createdCandidats[0]._id
    require('../middlewares/verify-token').__setIdCandidat(idCandidat)

    places = await createPlacesWithCreatedAtDiff()
    placesCreatedBefore = places.find(({ createdAt }) =>
      getFrenchLuxonFromJSDate(createdAt).equals(createdAtBefore)
    )
  })

  afterAll(async () => {
    await disconnect()
    Settings.now = () => Date.now
  })

  it('Should get 1 place for 75 when now is before 12h', async () => {
    Settings.now = () => new Date().setHours(11, 59, 59).valueOf()

    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}`
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(1)
  })
  it('Should get 3 places for 75 when now is after 12h', async () => {
    Settings.now = () => new Date().setHours(12, 0, 0).valueOf()

    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}`
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(3)
  })

  it('Should 200 with an available place before 12h when it is after 12h by centreId', async () => {
    Settings.now = () => new Date().setHours(12, 0, 0).valueOf()

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/${centreDateDisplay._id}?dateTime=${placeSelected}`
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(1)
    expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
  })
  it('Should 200 with an available place before 12h when it is after 12h by center name and geo-departement', async () => {
    Settings.now = () => new Date().setHours(12, 0, 0).valueOf()

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}&dateTime=${placeSelected}`
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(1)
    expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
  })

  it('Should 200 with no available place before 12h when it is before 12h by centreId', async () => {
    Settings.now = () => new Date().setHours(11, 59, 59).valueOf()

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/${centreDateDisplay._id}?dateTime=${placeSelected}`
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(0)
  })

  it('Should 200 with no available place before 12h when it is after 12h by center name and geo-departement', async () => {
    Settings.now = () => new Date().setHours(11, 59, 59).valueOf()

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}&dateTime=${placeSelected}`
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(0)
  })

  it('should booked place by candidat with info bookedAt when it is after 12h', async () => {
    Settings.now = () => new Date().setHours(12, 0, 0).valueOf()

    const { body } = await request(app)
      .patch(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .send({
        nomCentre: centreDateDisplay.nom,
        geoDepartement: centreDateDisplay.geoDepartement,
        date: placesCreatedBefore.date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)

    const placefounded = await findPlaceByCandidatId(idCandidat)
    expect(placefounded).toBeDefined()
    expect(placefounded).toHaveProperty('bookedAt')
    expect(placefounded).toHaveProperty('date', placesCreatedBefore.date)
    expect(placefounded).toHaveProperty('centre', placesCreatedBefore.centre)

    placefounded.candidat = undefined
    await placefounded.save()
  })

  it('should not booked place by candidat with info bookedAt when it is before 12h', async () => {
    Settings.now = () => new Date().setHours(11, 59, 59).valueOf()

    const { body } = await request(app)
      .patch(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .send({
        nomCentre: centreDateDisplay.nom,
        geoDepartement: centreDateDisplay.geoDepartement,
        date: placesCreatedBefore.date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .expect(400)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty(
      'message',
      "Il n'y a pas de place pour ce créneau"
    )

    const placefounded = await findPlaceByCandidatId(idCandidat)
    expect(placefounded).toBeNull()
  })
})
