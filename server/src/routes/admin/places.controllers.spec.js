import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { DateTime } from 'luxon'

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
import { getPlaces, updatePlaces } from '../admin/places.controllers'
import centreModel from '../../models/centre/centre.model'
import { createPlace } from '../../models/place'
import placeModel from '../../models/place/place.model'
import { RESA_PLACE_HAS_BOOKED } from './message.constants'

const addPlacesWithNewInspecteur = places => {
  return Promise.all(
    places.map(({ date, centre, inspecteur }) => {
      return createPlace({ date, centre, inspecteur: inspecteur + '1' })
    })
  )
}

describe('Test places controller', () => {
  describe('get places', () => {
    const app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.use(getPlaces)

    beforeAll(async () => {
      await connect()
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
      await disconnect()
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
  describe('update reservation by admin', () => {
    let placesCreated
    let candidatsCreated
    let centresCreated

    const app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.put('/reservation', updatePlaces)

    beforeAll(async () => {
      await connect()
      centresCreated = await createCentres()
      candidatsCreated = await createCandidats()
      placesCreated = await createPlaces()

      await makeResas()
    })
    afterAll(async () => {
      await Promise.all(
        placesCreated.map(elt => {
          return elt.remove()
        })
      )
      await Promise.all(
        centresCreated.map(elt => {
          return elt.remove()
        })
      )
      await Promise.all(
        candidatsCreated.map(elt => {
          return elt.remove()
        })
      )
      await disconnect()
    })

    it('should 200 when modify inspecteur from a reservation', async () => {
      const {
        _id: resa,
        candidat,
        date,
        centre,
        // inspecteur,
      } = await placeModel.findOne({
        candidat: { $exists: true },
      })

      const inspecteur = 'inspecteurTest'
      await createPlace({
        date,
        centre,
        inspecteur,
      })

      const departement = '93'
      const { body } = await request(app)
        .put('/reservation')
        .send({
          departement,
          resa,
          inspecteur,
        })
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('inspecteur', inspecteur)
      expect(body.candidat.toString()).toEqual(candidat.toString())
      expect(body.centre.toString()).toEqual(centre.toString())
      expect(body).toHaveProperty(
        'date',
        DateTime.fromJSDate(date)
          .setZone('utc')
          .toISO()
      )
    })

    it('should 400 when modify inspecteur from a reservation with anthor reservation', async () => {
      const {
        _id: resa,
        date,
        centre,
        // inspecteur,
      } = await placeModel.findOne({
        candidat: { $exists: true },
      })

      const inspecteur = 'inspecteurTest'
      const candidat = candidatsCreated[2]._id
      await createPlace({
        date,
        centre,
        inspecteur,
        candidat,
      })

      const departement = '93'
      const { body } = await request(app)
        .put('/reservation')
        .send({
          departement,
          resa,
          inspecteur,
        })
        .set('Accept', 'application/json')
        .expect(400)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', RESA_PLACE_HAS_BOOKED)
    })
  })
})
