import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { DateTime } from 'luxon'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import { createPlaces } from '../../models/__tests__/places'
import {
  RESA_NO_BOOKED,
  RESA_BOOKED_CANCEL,
  RESA_PLACE_HAS_BOOKED,
} from './message.constants'
import { createCentres } from '../../models/__tests__/centres'
import { createCandidats } from '../../models/__tests__/candidats'
import { makeResas } from '../../models/__tests__/reservations'
import { createUser } from '../../models/user'
import { updateReservationByAdmin } from './reservations.controller'
import placeModel from '../../models/place/place.model'

import { createPlace } from '../../models/place'

const deleteData = elt => {
  return elt.remove()
}
const email = 'test@example.com'
const password = 'S3cr3757uff!'
const deps = ['75', '93']

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')

xdescribe('reservation by admin', () => {
  describe('delete reservation by admin', () => {
    let placesCreated
    let candidatsCreated
    let centresCreated
    let admin
    beforeAll(async () => {
      await connect()
      admin = await createUser(email, password, deps)
      centresCreated = await createCentres()
      placesCreated = await createPlaces()
      candidatsCreated = await createCandidats()
      await makeResas()
      require('../middlewares/verify-token').__setIdAdmin(admin._id, deps)
    })

    afterAll(async () => {
      await Promise.all(placesCreated.map(deleteData))
      await Promise.all(centresCreated.map(deleteData))
      await Promise.all(candidatsCreated.map(deleteData))
      await disconnect()
    })

    it('should 400 when a place has not booked', async () => {
      const placeSelected = placesCreated[4]
      const { body } = await request(app)
        .delete(`${apiPrefix}/admin/reservations/${placeSelected._id}`)
        .set('Accept', 'application/json')
        .expect(400)
      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', RESA_NO_BOOKED)
    })
    it('should 200 when a place booked', async () => {
      const placeSelected = placesCreated[0]
      const { body } = await request(app)
        .delete(`${apiPrefix}/admin/reservations/${placeSelected._id}`)
        .set('Accept', 'application/json')
        .expect(200)
      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('message', RESA_BOOKED_CANCEL)
    })
  })

  describe('update reservation by admin', () => {
    let placesCreated
    let candidatsCreated
    let centresCreated

    const app = express()
    app.use(bodyParser.json({ limit: '20mb' }))
    app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
    app.put('/reservation', updateReservationByAdmin)

    beforeAll(async () => {
      await connect()
      centresCreated = await createCentres()
      candidatsCreated = await createCandidats()
      placesCreated = await createPlaces()

      await makeResas()
    })
    afterAll(async () => {
      await Promise.all(placesCreated.map(deleteData))
      await Promise.all(centresCreated.map(deleteData))
      await Promise.all(candidatsCreated.map(deleteData))
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
      const placeNotBooked = await createPlace({
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
          place: placeNotBooked._id,
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
      const placeNotBooked = await createPlace({
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
          place: placeNotBooked._id,
        })
        .set('Accept', 'application/json')
        .expect(400)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', RESA_PLACE_HAS_BOOKED)
    })
  })
})
