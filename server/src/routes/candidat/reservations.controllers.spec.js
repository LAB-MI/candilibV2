import request from 'supertest'
import { DateTime } from 'luxon'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import {
  createCandidats,
  createCentres,
  createPlaces,
  removePlaces,
  removeCentres,
  deleteCandidats,
  createTestPlace,
  makeResa,
} from '../../models/__tests__'
import {
  SAVE_RESA_WITH_MAIL_SENT,
  CANCEL_RESA_WITH_MAIL_SENT,
  SAME_RESA_ASKED,
  SEND_MAIL_ASKED,
  CAN_BOOK_AT,
} from './message.constants'
import { findPlaceById, findPlaceByCandidatId } from '../../models/place'
import config from '../../config'
import { findCandidatById } from '../../models/candidat'
import { dateTimeToDateAndHourFormat } from '../../util/date.util'

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')

describe('Test reservation controllers', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
    await app.close()
  })

  describe('Réserver une place', () => {
    let createdCentres
    let createdPlaces
    let createdCandiats
    beforeAll(async () => {
      createdCandiats = await createCandidats()
      createdCentres = await createCentres()
      createdPlaces = await createPlaces()
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
    })

    it('Should get 200 to book one place', async () => {
      console.debug('Should get 200 to book one place')
      const selectedCandidat = createdCandiats[0]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )
      const selectedCentre = createdCentres[0]
      const selectedPlace = createdPlaces[0]

      const { body } = await request(app)
        .post(`${apiPrefix}/candidat/reservations`)
        .send({
          id: selectedCentre._id,
          date: selectedPlace.date,
          isAccompanied: true,
          hasDualControlCar: true,
        })
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('statusmail', true)
      expect(body).toHaveProperty('message', SAVE_RESA_WITH_MAIL_SENT)
      expect(body).toHaveProperty('reservation')
      expect(body.reservation).toHaveProperty(
        'date',
        DateTime.fromJSDate(selectedPlace.date)
          .setZone('utc')
          .toISO()
      )
      expect(body.reservation).toHaveProperty('centre', selectedCentre.nom)
      expect(body.reservation).toHaveProperty(
        'departement',
        selectedCentre.departement
      )
      expect(body.reservation).toHaveProperty('isBooked', true)
      expect(body.reservation).not.toHaveProperty('inspecteur')
    })

    it('Should get 200 to book another place', async () => {
      console.debug('Should get 200 to book a another place')
      const selectedCandidat = createdCandiats[0]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )
      const selectedCentre = createdCentres[1]
      const selectedPlace = createdPlaces[1]
      const placeCandidat = await findPlaceByCandidatId(selectedCandidat._id)
      console.debug(placeCandidat)
      const previewsPlaceId = placeCandidat[0]._id
      console.debug(previewsPlaceId)
      const { body } = await request(app)
        .post(`${apiPrefix}/candidat/reservations`)
        .send({
          id: selectedCentre._id,
          date: selectedPlace.date,
          isAccompanied: true,
          hasDualControlCar: true,
        })
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('statusmail', true)
      expect(body).toHaveProperty('message', SAVE_RESA_WITH_MAIL_SENT)
      expect(body).toHaveProperty('reservation')
      expect(body.reservation).toHaveProperty(
        'date',
        DateTime.fromJSDate(selectedPlace.date)
          .setZone('utc')
          .toISO()
      )
      expect(body.reservation).toHaveProperty('centre', selectedCentre.nom)
      expect(body.reservation).toHaveProperty(
        'departement',
        selectedCentre.departement
      )
      expect(body.reservation).toHaveProperty('isBooked', true)
      expect(body.reservation).not.toHaveProperty('inspecteur')

      const previewPlace = await findPlaceById(previewsPlaceId)
      expect(previewPlace).toHaveProperty('isBooked', false)
      expect(previewPlace.bookedBy).toBeUndefined()
    })

    it('Should get 400 to book a same place', async () => {
      console.debug('Should get 400 to book a same place')
      const selectedCandidat = createdCandiats[0]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )
      const selectedCentre = createdCentres[1]
      const selectedPlace = createdPlaces[1]

      const { body } = await request(app)
        .post(`${apiPrefix}/candidat/reservations`)
        .send({
          id: selectedCentre._id,
          date: selectedPlace.date,
          isAccompanied: true,
          hasDualControlCar: true,
        })
        .set('Accept', 'application/json')
        .expect(400)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', false)
      expect(body).toHaveProperty('message', SAME_RESA_ASKED)
      expect(body).not.toHaveProperty('statusmail')
      expect(body).not.toHaveProperty('reservation')
    })

    it('Should get 200 to send mail of convocation', async () => {
      const selectedCandidat = createdCandiats[0]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )

      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/reservations?bymail=true`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('message', SEND_MAIL_ASKED)
    })

    it('Should get 200 to get the candidat reservation', async () => {
      const selectedCandidat = createdCandiats[0]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )

      const selectedCentre = createdCentres[1]
      const selectedPlace = createdPlaces[1]

      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/reservations`)
        .set('Accept', 'application/json')
        .expect(200)

      const dateTimeResa = DateTime.fromJSDate(selectedPlace.date)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('date', dateTimeResa.setZone('utc').toISO())
      expect(body.centre).toBeDefined()
      expect(body.centre).toHaveProperty('nom', selectedCentre.nom)
      expect(body.centre).toHaveProperty(
        'departement',
        selectedCentre.departement
      )
      expect(body.centre).toHaveProperty('adresse', selectedCentre.adresse)
      expect(body.inspecteur).toBeUndefined()
      expect(body.bookedBy).toBeUndefined()
      expect(body.isBooked).toBeUndefined()
      expect(body).toHaveProperty(
        'lastDateToCancel',
        dateTimeResa.minus({ days: config.daysForbidCancel }).toISODate()
      )
    })
  })

  describe('Cancel a reservation', () => {
    let createdCandiats
    const basePlaceDateTime = DateTime.fromObject({ hour: 9 })
    const placeCancellable = {
      date: (() =>
        basePlaceDateTime
          .plus({ day: config.daysForbidCancel + 1, hour: 1 })
          .toISO())(),
      centre: 'Centre 2',
      inspecteur: 'Inspecteur 2',
    }
    const placeNoCancellable = {
      date: (() =>
        basePlaceDateTime
          .plus({ day: config.daysForbidCancel - 1, hour: 1 })
          .toISO())(),
      centre: 'Centre 2',
      inspecteur: 'Inspecteur 2',
    }

    beforeAll(async () => {
      createdCandiats = await createCandidats()
      await createCentres()
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
    })

    it('Should get 200 to cancel a reservation without penalty', async () => {
      const place = await createTestPlace(placeCancellable)
      await makeResa(place, createdCandiats[0])

      const selectedCandidat = createdCandiats[0]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )
      const { body } = await request(app)
        .delete(`${apiPrefix}/candidat/reservations`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('statusmail', true)
      expect(body).toHaveProperty('message', CANCEL_RESA_WITH_MAIL_SENT)

      const previewPlace = await findPlaceById(place._id)
      expect(previewPlace).toHaveProperty('isBooked', false)
      expect(previewPlace.bookedBy).toBeUndefined()

      const candidat = await findCandidatById(selectedCandidat._id)
      expect(candidat).toBeDefined()
      expect(candidat.canBookAfter).toBeUndefined()
    })

    it('Should get 200 to cancel a reservation with penalty', async () => {
      const place = await createTestPlace(placeNoCancellable)
      await makeResa(place, createdCandiats[0])

      const selectedCandidat = createdCandiats[0]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )
      const { body } = await request(app)
        .delete(`${apiPrefix}/candidat/reservations`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('statusmail', true)

      expect(body).toHaveProperty(
        'message',
        CANCEL_RESA_WITH_MAIL_SENT +
          ' ' +
          CAN_BOOK_AT +
          dateTimeToDateAndHourFormat(
            DateTime.fromJSDate(place.date)
              .endOf('days')
              .plus({
                days: config.timeoutToRetry,
              })
          ).date
      )

      const previewPlace = await findPlaceById(place._id)
      expect(previewPlace).toHaveProperty('isBooked', false)
      expect(previewPlace.bookedBy).toBeUndefined()

      const candidat = await findCandidatById(selectedCandidat._id)
      expect(candidat).toBeDefined()
      expect(candidat).toHaveProperty('canBookAfter')
    })
  })
})
