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
import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../util'
import { findPlaceByCandidatId } from '../../models/place'
import PlaceModel from '../../models/place/place.model'

import {
  setNowBefore12h,
  setNowAtNow,
  setNowAfter12h,
} from './__tests__/luxon-time-setting'

import { verifyAccesPlacesByCandidat } from './middlewares/verify-candidat'
import { candidatStatuses } from '../common/__mocks__/candidat-status-const'
import { updateCandidatById } from '../../models/candidat'

import { placesAndGeoDepartementsAndCentresCache } from '../middlewares'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')
jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-user')
jest.mock('./middlewares/verify-candidat')
jest.mock('./middlewares/captcha-try-submission')

jest.mock('../common/candidat-status-const')

expect.extend({
  toBeResponseStatus (received, expected) {
    if (received.status !== expected) {
      return {
        message: () => `expected ${expected}, got ${received.status}\n Body is ${JSON.stringify(received.body)}`,
        pass: false,
      }
    }
    return {
      pass: true,
    }
  },
})

async function expectedPlaces (nbplaces) {
  const response = await request(app)
    .get(
      `${apiPrefix}/candidat/places?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}`,
    )
    .set('Accept', 'application/json')
  expect(response).toBeResponseStatus(200)
  const { body } = response
  expect(body).toBeDefined()
  expect(body).toHaveLength(nbplaces)
}

const expectedPlaceByNameCentreAndGeoDep = async (date, nbPlaces) => {
  const placeSelected = encodeURIComponent(date)
  const response = await request(app)
    .get(
      `${apiPrefix}/candidat/places/?geoDepartement=${centreDateDisplay.geoDepartement}&nomCentre=${centreDateDisplay.nom}&dateTime=${placeSelected}`,
    )
    .set('Accept', 'application/json')
  expect(response).toBeResponseStatus(200)
  const { body } = response

  expect(body).toBeDefined()
  expect(body).toHaveLength(nbPlaces)
  nbPlaces && expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
}
const expectedBooked = async (placeSelected, idCandidat) => {
  const response = await request(app)
    .patch(`${apiPrefix}/candidat/places`)
    .set('Accept', 'application/json')
    .send({
      nomCentre: centreDateDisplay.nom,
      geoDepartement: centreDateDisplay.geoDepartement,
      date: placeSelected.date,
      isAccompanied: true,
      hasDualControlCar: true,
    })

  expect(response).toBeResponseStatus(200)
  const { body } = response
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

describe('Get places available and display at 12h.', () => {
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
    await placesAndGeoDepartementsAndCentresCache.setGeoDepartemensAndCentres()
    await placesAndGeoDepartementsAndCentresCache.setPlaces()
  })

  afterAll(async () => {
    await disconnect()
    setNowAtNow()
  })

  describe.each`
  homeDept | isInRecentlyDept |  hasPenalty
  ${'93'}  | ${true}          |  ${false}
  ${'75'}  | ${false}         |  ${false}
  ${'75'}  | ${true}          |  ${false}
  ${'75'}  | ${true}          |  ${true}
  `('Departement $homeDept is recently added: $isInRecentlyDept. Have penalty: $hasPenalty ', ({ homeDept, isInRecentlyDept, hasPenalty }) => {
    const isFirstStatus = isInRecentlyDept && homeDept === '75' && !hasPenalty
    describe.each`
      status       | statuses            | after12hExpected         | after12h20Expected       | after12h50Expected | selectedAfter12h         | selectedAfter12h20       | selectedAfter12h50 | canBookedAfter12h             | canBookedAfter12h20           | canBookedAfter12h50
      ${undefined} | ${undefined}        | ${3}                     | ${3}                     | ${3}               | ${1}                     | ${1}                     | ${1}               | ${''}                         | ${''}                         | ${''}
      ${'0'}       | ${candidatStatuses} | ${3}                     | ${3}                     | ${3}               | ${1}                     | ${1}                     | ${1}               | ${''}                         | ${''}                         | ${''}
      ${'2'}       | ${candidatStatuses} | ${isFirstStatus ? 3 : 1} | ${3}                     | ${3}               | ${isFirstStatus ? 1 : 0} | ${1}                     | ${1}               | ${isFirstStatus ? '' : 'not'} | ${''}                         | ${''}
      ${'5'}       | ${candidatStatuses} | ${isFirstStatus ? 3 : 1} | ${isFirstStatus ? 3 : 1} | ${3}               | ${isFirstStatus ? 1 : 0} | ${isFirstStatus ? 1 : 0} | ${1}               | ${isFirstStatus ? '' : 'not'} | ${isFirstStatus ? '' : 'not'} | ${''}
      ${'6'}       | ${candidatStatuses} | ${isFirstStatus ? 3 : 1} | ${isFirstStatus ? 3 : 1} | ${3}               | ${isFirstStatus ? 1 : 0} | ${isFirstStatus ? 1 : 0} | ${1}               | ${isFirstStatus ? '' : 'not'} | ${isFirstStatus ? '' : 'not'} | ${''}
      `('for status:$status', ({ status, statuses, after12hExpected, after12h20Expected, after12h50Expected, selectedAfter12h, selectedAfter12h20, selectedAfter12h50, canBookedAfter12h, canBookedAfter12h20, canBookedAfter12h50 }) => {
      beforeAll((done) => {
        const moduleCandidatStatuses = require('../common/candidat-status-const')
        moduleCandidatStatuses.candidatStatuses = statuses

        verifyAccesPlacesByCandidat.mockImplementation(async (req, res, next) => {
          const verifyCandidat = jest.requireActual('./middlewares/verify-candidat')
          req.isInRecentlyDept = isInRecentlyDept
          req.candidatHomeDepartement = homeDept
          const nextTmp = () => {
          }
          await verifyCandidat.verifyAccesPlacesByCandidat(req, res, nextTmp)
          next()
        })

        updateCandidatById(idCandidat, {
          status,
          canBookFrom: getFrenchLuxon().plus({ days: hasPenalty ? 1 : -1 }),
        },
        ).catch((error) => {
          throw error
        }).finally(() => {
          done()
        })
      })
      afterEach((done) => {
        PlaceModel.updateMany({ candidat: { $exists: true } }, { $set: { candidat: undefined, booked: undefined } }).exec().finally(() => {
          done()
        })
      })

      afterAll(() => {
        setNowAtNow()
      })

      it('Should get 1 place for 75 when now is before 12h', (done) => {
        setNowBefore12h()
        expectedPlaces(1).catch((error) => {
          throw error
        }).finally(() => {
          done()
        })
      })

      it.each`
        npPlacesExpected      | minutes
        ${after12hExpected}   | ${0}
        ${after12h20Expected} | ${20}
        ${after12h50Expected} | ${50}
      `(`Should get $npPlacesExpected places for 75 when now is after 12h$minutes for status ${status}`, ({ npPlacesExpected, minutes }, done) => {
        setNowAfter12h(minutes)
        expectedPlaces(npPlacesExpected).catch((error) => {
          throw error
        }).finally(() => {
          done()
        })
      })

      it.each`
        npPlacesExpected        | minutes
        ${selectedAfter12h}     | ${0}
        ${selectedAfter12h20}   | ${20}
        ${selectedAfter12h50}   | ${50}
      `(`Should 200 with $npPlacesExpected available place before 12h when it is after 12h$minutes by center name and geo-departement for status ${status}`, async ({ npPlacesExpected, minutes }, done) => {
        setNowAfter12h(minutes)
        expectedPlaceByNameCentreAndGeoDep(placesCreatedBefore.date, npPlacesExpected).catch((error) => {
          throw error
        }).finally(() => {
          done()
        })
      })

      it('Should 200 with no available place before 12h when it is after 12h by center name and geo-departement', (done) => {
        setNowBefore12h()
        expectedPlaceByNameCentreAndGeoDep(placesCreatedBefore.date, 0).catch((error) => {
          throw error
        }).finally(() => {
          done()
        })
      })

      it('should not booked place by candidat with info bookedAt when it is before 12h', (done) => {
        setNowBefore12h()
        expectedBookedFailed(placesCreatedBefore, idCandidat).catch((error) => {
          throw error
        }).finally(() => {
          done()
        })
      })

      it.each`
        canBooked               | minutes
        ${canBookedAfter12h}    | ${0}
        ${canBookedAfter12h20}  | ${20}
        ${canBookedAfter12h50}  | ${50}
      `('should $canBooked booked place by candidat with info bookedAt when it is after 12h$minutes', ({ canBooked, minutes }, done) => {
        setNowAfter12h(minutes)
        if (canBooked === 'not') {
          expectedBookedFailed(placesCreatedBefore, idCandidat).catch((error) => {
            throw error
          }).finally(() => {
            done()
          })
        } else {
          expectedBooked(placesCreatedBefore, idCandidat).catch((error) => {
            throw error
          }).finally(() => {
            done()
          })
        }
      })
    })
  })
})
