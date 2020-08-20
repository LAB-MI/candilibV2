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
  createdAtBefore,
} from '../../models/__tests__/places.date.display'
import { getFrenchLuxonFromJSDate } from '../../util'
import { findPlaceByCandidatId } from '../../models/place'
import {
  setHoursMinutesSeconds,
  setNowAtNow,
} from './__tests__/luxon-time-setting'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')
jest.mock('../business/send-mail')

describe('Get places available and display when delay left', () => {
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
      getFrenchLuxonFromJSDate(createdAt).equals(createdAtBefore),
    )
  })

  afterAll(async () => {
    await disconnect()
    setNowAtNow()
  })

  it('Should get 1 place for 75 when now is 12:00:01', async () => {
    setHoursMinutesSeconds(12, 0, 1)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places?geoDepartement=${centreDateDisplay01.geoDepartement}&nomCentre=${centreDateDisplay01.nom}`,
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(1)
  })
  it('Should get 3 places for 75 when now is is 16:00:01', async () => {
    setHoursMinutesSeconds(16, 0, 1)

    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places?geoDepartement=${centreDateDisplay01.geoDepartement}&nomCentre=${centreDateDisplay01.nom}`,
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(3)
  })

  it('Should 200 with an available place by centreId when delay left', async () => {
    setHoursMinutesSeconds(12, 0, 1)

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/${centreDateDisplay01._id}?dateTime=${placeSelected}`,
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(1)
    expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
  })
  it('Should 200 with an available place by center name and geo-departement when delay left', async () => {
    setHoursMinutesSeconds(12, 0, 1)

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/?geoDepartement=${centreDateDisplay01.geoDepartement}&nomCentre=${centreDateDisplay01.nom}&dateTime=${placeSelected}`,
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(1)
    expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
  })

  it('Should 200 with no available place by centreId when delay not finish', async () => {
    setHoursMinutesSeconds(11, 59, 59)

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/${centreDateDisplay01._id}?dateTime=${placeSelected}`,
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(0)
  })

  it('Should 200 with no available place by center name and geo-departement when delay not finish', async () => {
    setHoursMinutesSeconds(11, 59, 59)

    const date = placesCreatedBefore.date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/?geoDepartement=${centreDateDisplay01.geoDepartement}&nomCentre=${centreDateDisplay01.nom}&dateTime=${placeSelected}`,
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(0)
  })

  it('should booked place by candidat with info bookedAt when it is after delay', async () => {
    setHoursMinutesSeconds(12, 0, 1)

    const { body } = await request(app)
      .patch(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .send({
        nomCentre: centreDateDisplay01.nom,
        geoDepartement: centreDateDisplay01.geoDepartement,
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

  it('should not booked place by candidat with info bookedAt when it is before delay', async () => {
    setHoursMinutesSeconds(11, 59, 59)

    const { body } = await request(app)
      .patch(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .send({
        nomCentre: centreDateDisplay01.nom,
        geoDepartement: centreDateDisplay01.geoDepartement,
        date: placesCreatedBefore.date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .expect(400)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty(
      'message',
      "Il n'y a pas de place pour ce créneau",
    )

    const placefounded = await findPlaceByCandidatId(idCandidat)
    expect(placefounded).toBeNull()
  })
})
