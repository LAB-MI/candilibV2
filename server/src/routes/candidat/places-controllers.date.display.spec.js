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
  visibleAtNow12h,
} from '../../models/__tests__/places.date.display'
import { getFrenchLuxonFromJSDate } from '../../util'
import { findPlaceByCandidatId } from '../../models/place'
import {
  setNowBefore12h,
  setNowAtNow,
  setNowAfter12h,
} from './__tests__/luxon-time-setting'

import { verifyAccesPlacesByCandidat } from './middlewares/verify-candidat'
import { candidatStatuses } from '../common/__mocks__/candidat-status-const'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')
jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-user')
jest.mock('./middlewares/verify-candidat')

jest.mock('../common/candidat-status-const')

async function expectedPlaces (nbplaces) {
  const { body } = await request(app)
    .get(
      `${apiPrefix}/candidat/places?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}`,
    )
    .set('Accept', 'application/json')
    .expect(200)
  expect(body).toBeDefined()
  expect(body).toHaveLength(nbplaces)
}
const expectedPlaceByCentreId = async (date, nbPlaces) => {
  const placeSelected = encodeURIComponent(date)
  const { body } = await request(app)
    .get(
      `${apiPrefix}/candidat/places/${centreDateDisplay._id}?dateTime=${placeSelected}`,
    )
    .set('Accept', 'application/json')
    .expect(200)
  expect(body).toBeDefined()
  expect(body).toHaveLength(nbPlaces)
  nbPlaces && expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
}
const expectedPlaceByNameCentreAndGeoDep = async (date, nbPlaces) => {
  const placeSelected = encodeURIComponent(date)
  const { body } = await request(app)
    .get(
      `${apiPrefix}/candidat/places/?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}&dateTime=${placeSelected}`,
    )
    .set('Accept', 'application/json')
    .expect(200)

  expect(body).toBeDefined()
  expect(body).toHaveLength(nbPlaces)
  nbPlaces && expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
}
const expectedBooked = async (placeSelected, idCandidat) => {
  const { body } = await request(app)
    .patch(`${apiPrefix}/candidat/places`)
    .set('Accept', 'application/json')
    .send({
      nomCentre: centreDateDisplay.nom,
      geoDepartement: centreDateDisplay.geoDepartement,
      date: placeSelected.date,
      isAccompanied: true,
      hasDualControlCar: true,
    })
    .expect(200)

  expect(body).toBeDefined()
  expect(body).toHaveProperty('success', true)

  const placefounded = await findPlaceByCandidatId(idCandidat)
  expect(placefounded).toBeDefined()
  expect(placefounded).toHaveProperty('bookedAt')
  expect(placefounded).toHaveProperty('date', placeSelected.date)
  expect(placefounded).toHaveProperty('centre', placeSelected.centre)

  placefounded.candidat = undefined
  placefounded.booked = undefined
  await placefounded.save()
}
const expectedBookedFailed = async (placeSelected, idCandidat) => {
  const { body } = await request(app)
    .patch(`${apiPrefix}/candidat/places`)
    .set('Accept', 'application/json')
    .send({
      nomCentre: centreDateDisplay.nom,
      geoDepartement: centreDateDisplay.geoDepartement,
      date: placeSelected.date,
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
}

describe('Get places available and display at 12h', () => {
  let places
  let placesCreatedBefore
  let idCandidat

  beforeAll(async () => {
    await connect()
    const createdCandidats = await createCandidats()
    idCandidat = createdCandidats[0]._id
    require('../middlewares/verify-token').__setIdCandidat(idCandidat)

    setInitCreatedCentre()
    resetCreatedInspecteurs()
    places = await createPlacesWithVisibleAt()
    placesCreatedBefore = places.find(({ visibleAt }) =>
      getFrenchLuxonFromJSDate(visibleAt).equals(visibleAtNow12h),
    )
  })

  afterAll(async () => {
    await disconnect()
    setNowAtNow()
  })

  describe.each`
  status | statuses | after12hExpected | after12h20Expected | after12h50Expected | selectedAfter12h | selectedAfter12h20 | selectedAfter12h50 | canBookedAfter12h | canBookedAfter12h20 | canBookedAfter12h50
  ${undefined} | ${undefined} | ${3} | ${3} | ${3} | ${1} | ${1} | ${1} | ${''} | ${''} | ${''}
  ${'0'} | ${candidatStatuses} | ${3} | ${3} | ${3} | ${1} | ${1} | ${1} | ${''} | ${''} | ${''}
  ${'2'} | ${candidatStatuses} | ${1} | ${3} | ${3} | ${0} | ${1} | ${1} | ${'not'} | ${''} | ${''}
  ${'5'} | ${candidatStatuses} | ${1} | ${1} | ${3} | ${0} | ${0} | ${1} | ${'not'} | ${'not'} | ${''}
  ${'6'} | ${candidatStatuses} | ${1} | ${1} | ${3} | ${0} | ${0} | ${1} | ${'not'} | ${'not'} | ${''}
`('for $status', ({ status, statuses, after12hExpected, after12h20Expected, after12h50Expected, selectedAfter12h, selectedAfter12h20, selectedAfter12h50, canBookedAfter12h, canBookedAfter12h20, canBookedAfter12h50 }) => {
    beforeAll(() => {
      const moduleCandidatStatuses = require('../common/candidat-status-const')
      moduleCandidatStatuses.candidatStatuses = statuses

      verifyAccesPlacesByCandidat.mockImplementation((req, res, next) => {
        req.userStatus = status
        next()
      })
    })

    afterAll(() => {
      setNowAtNow()
    })

    it('Should get 1 place for 75 when now is before 12h', async () => {
      setNowBefore12h()
      await expectedPlaces(1)
    })

    it.each([
      [after12hExpected, 0],
      [after12h20Expected, 20],
      [after12h50Expected, 50],
    ])(`Should get %i places for 75 when now is after 12h%i for status ${status}`, async (npPlacesExpected, minutes) => {
      setNowAfter12h(minutes)
      await expectedPlaces(npPlacesExpected)
    })

    it.each([
      [selectedAfter12h, 0],
      [selectedAfter12h20, 20],
      [selectedAfter12h50, 50],
    ])(`Should 200 with  %i available place before 12h when it is after 12h%i by center name and geo-departement for status ${status}`, async (npPlacesExpected, minutes) => {
      setNowAfter12h(minutes)
      await expectedPlaceByNameCentreAndGeoDep(placesCreatedBefore.date, npPlacesExpected)
    })

    it('Should 200 with no available place before 12h when it is after 12h by center name and geo-departement', async () => {
      setNowBefore12h()
      await expectedPlaceByNameCentreAndGeoDep(placesCreatedBefore.date, 0)
    })

    it('should not booked place by candidat with info bookedAt when it is before 12h', async () => {
      setNowBefore12h()
      await expectedBookedFailed(placesCreatedBefore, idCandidat)
    })

    it.each([
      [canBookedAfter12h, 0],
      [canBookedAfter12h20, 20],
      [canBookedAfter12h50, 50],
    ])('should %s booked place by candidat with info bookedAt when it is after 12h%i', async (canBooked, minutes) => {
      setNowAfter12h(minutes)
      if (canBooked === 'not') {
        await expectedBookedFailed(placesCreatedBefore, idCandidat)
      } else {
        await expectedBooked(placesCreatedBefore, idCandidat)
      }
    })
  })

  describe('For others', () => {
    beforeAll(async () => {
      const moduleCandidatStatuses = require('../common/candidat-status-const')
      moduleCandidatStatuses.candidatStatuses = undefined
    })
    it('Should 200 with an available place created before 12h when it is after 12h by centreId', async () => {
      setNowAfter12h()
      await expectedPlaceByCentreId(placesCreatedBefore.date, 1)
    })
  })
})
