import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'

import {
  createCandidats,
  setInitCreatedCentre,
  resetCreatedInspecteurs,
} from '../../models/__tests__'
import {
  createOnePlaceVisibleAt12h,
} from '../../models/__tests__/places.date.display'

import {
  setNowAfter12h,
  setNowAtNow,
} from '../candidat/__tests__/luxon-time-setting'

import { verifyAccesPlacesByCandidat } from '../candidat/middlewares/verify-candidat'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)
jest.mock('../middlewares/verify-token')
jest.mock('../middlewares/verify-user')
jest.mock('../common/candidat-status-const')
jest.mock('../candidat/middlewares/verify-candidat')
describe('For Status, Get centres with the numbers places available in departements and display at 12h by status', () => {
  let centreSelected1
  beforeAll(async () => {
    await connect()
    const createdCandidats = await createCandidats()
    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id,
    )

    setInitCreatedCentre()
    resetCreatedInspecteurs()
    const { centreSelected } = await createOnePlaceVisibleAt12h()
    centreSelected1 = centreSelected
  })

  afterAll(async () => {
    await disconnect()
  })

  describe.each`
  status | after12hExpected | after12h20Expected | after12h50Expected
  ${undefined} | ${0} | ${0} | ${1}
  ${0} | ${1} | ${1} | ${1}
  ${2} | ${0} | ${1} | ${1}
  ${5} | ${0} | ${0} | ${1}
  ${6} | ${0} | ${0} | ${1}
  `('for $status', ({ status, after12hExpected, after12h20Expected, after12h50Expected }) => {
    beforeAll(() => {
      verifyAccesPlacesByCandidat.mockImplementation((req, res, next) => {
        req.userStatus = status
        next()
      })
    })

    afterAll(async () => {
      setNowAtNow()
    })

    it.each([
      [after12hExpected, 0],
      [after12h20Expected, 20],
      [after12h50Expected, 50],
    ])(`Should response 200 to find centres with %i place from departement 75 when is after 12h%i for status ${status}`, async (expected, minutes) => {
      setNowAfter12h(minutes)

      const departement = centreSelected1.geoDepartement
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/centres?departement=${departement}`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveLength(2)
      const centre = body.find(
        ({ centre: { _id } }) =>
          _id.toString() === centreSelected1._id.toString(),
      )

      expect(centre).toHaveProperty('count', expected)
    })
  })
})
