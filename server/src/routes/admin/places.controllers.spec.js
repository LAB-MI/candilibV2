import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'

import { connect, disconnect } from '../../mongo-connection'

import {
  createCandidats,
  createCentres,
  createPlaces,
  removePlaces,
  removeCentres,
  deleteCandidats,
  centres,
  places,
  makeResas,
} from '../../models/__tests__'
import { getPlaces } from '../admin/places.controllers'
import centreModel from '../../models/centre/centre.model'
import { createPlace } from '../../models/place'

const addPlacesWithNewInspecteur = places => {
  return Promise.all(
    places.map(({ date, centre, inspecteur }) => {
      return createPlace({ date, centre, inspecteur: inspecteur + '1' })
    })
  )
}

describe('Test places controller', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('get places', () => {
    const app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.use(getPlaces)

    beforeAll(async () => {
      await createCandidats()
      await createCentres()
      const placesCreated = await createPlaces()
      await addPlacesWithNewInspecteur(placesCreated)
      await makeResas()
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
    })

    it('Should get 200 with 2 avialables places with inspecteurs for Centre 2', async () => {
      const centreSelected = await centreModel.findOne({ nom: centres[1].nom })
      const dateSelected = encodeURIComponent(places[2].date)
      const { body } = await request(app)
        .get(
          `/places?departement=93&centre=${
            centreSelected._id
          }&date=${dateSelected}`
        )
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveLength(2)
      body.forEach(place => {
        expect(place.inspecteur).toBeDefined()
        expect(place.inspecteur).not.toBeNull()
      })
    })
  })
})
