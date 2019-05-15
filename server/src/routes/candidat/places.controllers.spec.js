import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import {
  createCentres,
  createPlaces,
  removePlaces,
  removeCentres,
  centres,
  makeResas,
  createCandidats,
  deleteCandidats,
} from '../../models/__tests__'
import { ErrorMsgArgEmpty } from './places.controllers'
const { default: app, apiPrefix } = require('../../app')

jest.mock('../../util/logger')
jest.mock('../middlewares/verify-token')

xdescribe('Test places controllers', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  describe('Test get dates from places available', () => {
    let createdCentres
    beforeAll(async () => {
      await createCandidats()
      createdCentres = await createCentres()
      await createPlaces()
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
    })

    it('should get 400 when departement is not given', async () => {
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/places`)
        .set('Accept', 'application/json')
        .expect(400)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', ErrorMsgArgEmpty)
    })

    it('Should get 200 with 2 dates from places Centre 2', async () => {
      const centreSelected = centres[1]
      const { body } = await request(app)
        .get(
          `${apiPrefix}/candidat/places?departement=${
            centreSelected.departement
          }&centre=${centreSelected.nom}`
        )
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
    })

    describe('Test get dates from places available when there are booked', () => {
      beforeAll(async () => {
        await makeResas()
      })

      afterAll(async () => {
        await removePlaces()
      })

      it('Should get 200 with an available place for centre 2 at a day 19 11h', async () => {
        const centreSelected = createdCentres.find(
          centre => centre.nom === centres[1].nom
        )._id
        const placeSelected = encodeURIComponent((await createPlaces())[2].date)
        const { body } = await request(app)
          .get(
            `${apiPrefix}/candidat/places/${centreSelected}?date=${placeSelected}`
          )

          .set('Accept', 'application/json')
          .expect(200)
        expect(body).toBeDefined()
        expect(body).toHaveLength(1)
      })

      it('Should get 200 with an available place for centre 2 at a day 19 10h', async () => {
        const centreSelected = createdCentres.find(
          centre => centre.nom === centres[1].nom
        )._id
        const placeSelected = encodeURIComponent((await createPlaces())[1].date)
        const { body } = await request(app)
          .get(
            `${apiPrefix}/candidat/places/${centreSelected}?date=${placeSelected}`
          )
          .set('Accept', 'application/json')
          .expect(200)
        expect(body).toBeDefined()
        expect(body).toHaveLength(1)
      })
    })
  })
})
