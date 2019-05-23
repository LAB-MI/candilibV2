import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { DateTime } from 'luxon'

import { connect, disconnect } from '../../mongo-connection'

import { apiPrefix } from '../../app'

import {
  centres,
  createCandidats,
  createCandidatsAndUpdate,
  createCentres,
  createInspecteurs,
  createPlaces,
  deleteCandidats,
  makeResa,
  makeResas,
  removeCentres,
  removePlaces,
} from '../../models/__tests__'
import { getPlaces, updatePlaces } from '../admin/places.controllers'
import centreModel from '../../models/centre/centre.model'
import placeModel from '../../models/place/place.model'
import { createPlace } from '../../models/place'
import { RESA_PLACE_HAS_BOOKED } from './message.constants'
import { createInspecteur } from '../../models/inspecteur'

const inspecteurTest = {
  nom: 'Doggett',
  prenom: 'John',
  matricule: '047101112',
  email: 'john.doggett@x-files.com',
  departement: '93',
}
const inspecteurTest2 = {
  nom: 'Skinner',
  prenom: 'Walter',
  matricule: '047101113',
  email: 'Walter.Skinner@x-files.com',
  departement: '93',
}

describe('Test places controller', () => {
  let candidatsCreated
  let inspecteurCreated
  let inspecteurCreated2
  let centreSelected
  let placeSelected
  let place2Created
  const app = express()
  app.use(bodyParser.json({ limit: '20mb' }))
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
  app.get('/places', getPlaces)
  app.patch(`/reservation/:id`, updatePlaces)

  beforeAll(async () => {
    await connect()
    candidatsCreated = await createCandidats()
    inspecteurCreated = await createInspecteur(inspecteurTest)
    inspecteurCreated2 = await createInspecteur(inspecteurTest2)
    await createPlaces()
    await makeResas()
    centreSelected = await centreModel.findOne({ nom: centres[1].nom })
    placeSelected = await placeModel.findOne({
      centre: centreSelected._id,
      candidat: { $exists: true },
    })
    const { date, centre } = placeSelected
    await createPlace({
      date,
      centre,
      inspecteur: inspecteurCreated._id,
    })
    place2Created = await createPlace({
      date,
      centre,
      inspecteur: inspecteurCreated2._id,
    })
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
  })

  it('Should get 200 with 2 avialables places with inspecteurs for Centre 2', async () => {
    const dateSelected = encodeURIComponent(
      DateTime.fromJSDate(placeSelected.date).toISO()
    )
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
  it('should 200 when modify inspecteur from a reservation', async () => {
    const {
      _id: resa,
      candidat,
      date,
      centre,
      // inspecteur,
    } = placeSelected
    const inspecteur = inspecteurCreated._id

    const departement = '93'
    const { body } = await request(app)
      .patch(`/reservation/${resa}`)
      .send({
        departement,
        inspecteur,
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body.place).toBeDefined()
    expect(body.place).toHaveProperty('inspecteur', inspecteur.toString())
    expect(body.place.candidat.toString()).toEqual(candidat.toString())
    expect(body.place.centre.toString()).toEqual(centre.toString())
    expect(body.place).toHaveProperty(
      'date',
      DateTime.fromJSDate(date)
        .setZone('utc')
        .toISO()
    )
  })

  it('should 400 when modify inspecteur from a reservation with anthor reservation', async () => {
    const { _id: resa } = await placeModel.findOne({
      centre: placeSelected.centre,
      candidat: { $exists: true },
    })

    const inspecteur = inspecteurCreated2._id
    const candidat = candidatsCreated[2]._id
    await makeResa(place2Created, candidat)

    const departement = '93'
    const { body } = await request(app)
      .patch(`/reservation/${resa}`)
      .send({
        departement,
        inspecteur,
      })
      .set('Accept', 'application/json')
      .expect(400)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', RESA_PLACE_HAS_BOOKED)
  })
})

describe('update place by admin', () => {
  let placesCreated
  let candidatsCreatedAndUpdated

  const app = express()
  app.use(bodyParser.json({ limit: '20mb' }))
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
  app.patch(`${apiPrefix}/admin/places/:id`, updatePlaces)

  beforeAll(async () => {
    await connect()
    candidatsCreatedAndUpdated = await createCandidatsAndUpdate()
    placesCreated = await createPlaces()
  })

  afterAll(async () => {
    const places = placesCreated.map(elt => elt.remove())
    const candidats = candidatsCreatedAndUpdated.map(elt => elt.remove())

    await Promise.all([...places, ...candidats])
    await disconnect()
  })
  it('should return a 200 when assign candidat in available place', async () => {
    const [inspecteur1] = await createInspecteurs()
    const [centre1] = await createCentres()

    const placeCanBook = {
      date: DateTime.fromObject({ day: 18, hour: 9 })
        .setLocale('fr')
        .toISO(),
      inspecteur: inspecteur1,
      centre: centre1,
    }

    const place = await createPlace(placeCanBook)

    const candidat = candidatsCreatedAndUpdated[0]

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${place._id}`)
      .send({
        candidatId: candidat._id,
      })
      .expect(200)

    expect(DateTime.fromISO(body.place.date).toISO()).toBe(
      DateTime.fromJSDate(place.date).toISO()
    )
    expect(body.place).toHaveProperty(
      'inspecteur',
      place.inspecteur._id.toString()
    )
    expect(body.place).toHaveProperty('centre', place.centre._id.toString())
    expect(body.place).toHaveProperty('candidat', candidat._id.toString())
  })

  it('should return a 400 when place already booked', async () => {
    // Given
    const [inspecteur1] = await createInspecteurs()
    const [centre1] = await createCentres()

    const createdBookedPlace = {
      date: DateTime.fromObject({ day: 19, hour: 9 })
        .setLocale('fr')
        .toISO(),
      inspecteur: inspecteur1,
      centre: centre1,
      candidat: candidatsCreatedAndUpdated[0]._id,
    }

    const place = await createPlace(createdBookedPlace)

    const candidat = candidatsCreatedAndUpdated[2]

    // When
    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${place._id}`)
      .send({
        candidatId: candidat._id,
      })
      // Then
      .expect(400)

    expect(body).toHaveProperty('error', { _status: 400 })
    expect(body).toHaveProperty('message', 'Cette place est déja réservée')
    expect(body).toHaveProperty('success', false)
  })

  it('should return a 422 when trying to assign unexisting candidat to place', async () => {
    const place = placesCreated[0]
    const unexistingCandidatId = '5cda8d17c522ad6a16e3633b'

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${place._id}`)
      .send({
        candidatId: unexistingCandidatId,
      })
      .expect(422)

    expect(body).toHaveProperty('error', { _status: 422 })
    expect(body).toHaveProperty(
      'message',
      'Les paramètres renseignés sont incorrects'
    )
    expect(body).toHaveProperty('success', false)
  })

  it('should return a 422 when trying to assign candidat to unexisting place', async () => {
    const unexistingPlaceId = '5cda8d17c522ad6a16e3633b'
    const candidat = candidatsCreatedAndUpdated[2]

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${unexistingPlaceId}`)
      .send({
        candidatId: candidat._id,
      })
      .expect(422)

    expect(body).toHaveProperty('error', { _status: 422 })
    expect(body).toHaveProperty(
      'message',
      'Les paramètres renseignés sont incorrects'
    )
    expect(body).toHaveProperty('success', false)
  })

  it('should return a 400 when trying to assign not yet validated candidat to place', async () => {
    const [inspecteur1] = await createInspecteurs()
    const [centre1] = await createCentres()

    const createdPlace1 = {
      date: DateTime.fromObject({ day: 20, hour: 9 })
        .setLocale('fr')
        .toISO(),
      inspecteur: inspecteur1,
      centre: centre1,
    }

    const place = await createPlace(createdPlace1)

    const candidat = candidatsCreatedAndUpdated[3]

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${place._id}`)
      .send({
        candidatId: candidat._id,
      })
      .expect(400)

    expect(body).toHaveProperty('error', { _status: 400 })
    expect(body).toHaveProperty(
      'message',
      "Le candidat n'est pas validé par Aurige"
    )
    expect(body).toHaveProperty('success', false)
  })
})
