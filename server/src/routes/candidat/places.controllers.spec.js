import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import {
  createCentres,
  createPlaces,
  removePlaces,
  removeCentres,
  centres,
  places,
  makeResas,
  createCandidats,
  deleteCandidats,
  nbPlacesByCentres,
} from '../../models/__tests__'
import { ErrorMsgArgEmpty } from './places.controllers'
const { default: app, apiPrefix } = require('../../app')

jest.mock('../middlewares/verify-token')

describe('Test places controllers', () => {
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

    it('should get 400 when there are not information centre', async () => {
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
      expect(body).toHaveLength(nbPlacesByCentres(centreSelected))
    })

    describe('Test get dates from places available when there are reservations', () => {
      beforeAll(async () => {
        await makeResas()
      })

      it('Should get 200 with a available place for centre 2 at a day 19 11h', async () => {
        const centreSelected = createdCentres.find(
          centre => centre.nom === centres[1].nom
        )._id
        const placeSelected = encodeURIComponent(places[2].date)
        const { body } = await request(app)
          .get(
            `${apiPrefix}/candidat/places/${centreSelected}?date=${placeSelected}`
          )

          .set('Accept', 'application/json')
          .expect(200)
        expect(body).toBeDefined()
        expect(body).toHaveLength(1)
      })
      it('Should get 200 with a available place for centre 2 at a day 19 10h', async () => {
        const centreSelected = createdCentres.find(
          centre => centre.nom === centres[1].nom
        )._id
        const placeSelected = encodeURIComponent(places[1].date)
        const { body } = await request(app)
          .get(
            `${apiPrefix}/candidat/places/${centreSelected}?date=${placeSelected}`
          )
          .set('Accept', 'application/json')
          .expect(200)
        expect(body).toBeDefined()
        expect(body).toHaveLength(0)
      })
    })
  })
})
