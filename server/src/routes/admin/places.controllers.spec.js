import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { DateTime } from 'luxon'

import { connect, disconnect } from '../../mongo-connection'

import {
  createCandidats,
  createPlaces,
  removePlaces,
  removeCentres,
  centres,
  makeResas,
  deleteCandidats,
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
  const app = express()
  app.use(bodyParser.json({ limit: '20mb' }))
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
  app.get('/places', getPlaces)
  app.put('/reservation', updatePlaces)
  beforeAll(async () => {
    await connect()
    candidatsCreated = await createCandidats()
    // await createCentres()
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
    await createPlace({
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
      .put('/reservation')
      .send({
        departement,
        resa,
        inspecteur,
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('inspecteur', inspecteur.toString())
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

    const inspecteur = inspecteurCreated2._id
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
