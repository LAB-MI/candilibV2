import request from 'supertest'
import bodyParser from 'body-parser'
import express from 'express'
import app, { apiPrefix } from '../../app'
import config from '../../config'
import { findCandidatById } from '../../models/candidat'
import centreModel from '../../models/centre/centre.model'
import { createInspecteur } from '../../models/inspecteur'
import { createPlace, findPlaceById } from '../../models/place'
import placeModel from '../../models/place/place.model'
import { createUser } from '../../models/user'
import { createCentre } from '../../models/centre/centre.queries'

import {
  bookCandidatOnSelectedPlace,
  centres,
  commonBasePlaceDateTime,
  createCandidats,
  createCandidatsAndUpdate,
  createCandidatAndUpdate,
  createCentres,
  createInspecteurs,
  createPlaces,
  deleteCandidats,
  makeCandidatsResas,
  makeResa,
  makeResas,
  removeCentres,
  removePlaces,
  setInitCreatedCentre,
  setInitCreatedPlaces,
} from '../../models/__tests__'
import { connect, disconnect } from '../../mongo-connection'
import {
  getFrenchFormattedDateTime,
  getFrenchLuxon,
  getFrenchLuxonFromISO,
  getFrenchLuxonFromJSDate,
  getFrenchLuxonFromObject,
} from '../../util'
import {
  deletePlacesByAdmin,
  getPlaces,
  updatePlaces,
} from '../admin/places.controllers'
import { SUBJECT_CONVOCATION } from '../business'
import { getConvocationBody } from '../business/build-mail-convocation'
import { REASON_MODIFY_RESA_ADMIN } from '../common/reason.constants'
import {
  DELETE_PLACES_BY_ADMIN_ERROR,
  DELETE_PLACES_BY_ADMIN_SUCCESS,
  PLACE_IS_ALREADY_BOOKED,
} from './message.constants'

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
const admin = {
  email: 'test1@example.com',
  password: 'S3cr3757uff!',
  departements: ['94', '95'],
  status: config.userStatuses.TECH,
}

const bookedAt = getFrenchLuxon().toJSDate()

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')
jest.mock('../../util/token')

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

  beforeAll(async () => {
    await connect()
    const user = await createUser(
      admin.email,
      admin.password,
      admin.departements,
      admin.status
    )

    app.use((req, res, next) => {
      req.userId = user._id
      next()
    })
    app.get('/places', getPlaces)
    app.patch('/reservation/:id', updatePlaces)

    candidatsCreated = await createCandidats()
    inspecteurCreated = await createInspecteur(inspecteurTest)
    inspecteurCreated2 = await createInspecteur(inspecteurTest2)
    await createPlaces()
    await makeResas(bookedAt)
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
      getFrenchLuxonFromJSDate(placeSelected.date).toISO()
    )
    const { body } = await request(app)
      .get(
        `/places?departement=93&centre=${centreSelected._id}&date=${dateSelected}`
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
      getFrenchLuxonFromJSDate(date)
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
    await makeResa(place2Created, candidat, bookedAt)

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
    expect(body).toHaveProperty('message', PLACE_IS_ALREADY_BOOKED)
  })
})

describe('update place by admin', () => {
  let candidatsCreatedAndUpdated

  const app = express()
  app.use(bodyParser.json({ limit: '20mb' }))
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

  beforeAll(async () => {
    await connect()
    setInitCreatedCentre()
    setInitCreatedPlaces()
    const user = await createUser(
      admin.email,
      admin.password,
      admin.departements,
      admin.status
    )

    app.use((req, res, next) => {
      req.userId = user._id
      next()
    })
    app.patch(`${apiPrefix}/admin/places/:id`, updatePlaces)

    candidatsCreatedAndUpdated = await createCandidatsAndUpdate()
    require('../../util/logger').setWithConsole(false)
  })

  afterAll(async () => {
    const candidats = candidatsCreatedAndUpdated.map(elt => elt.remove())

    await Promise.all([...candidats])
    await disconnect()
  })

  it('should return a 200 when assign candidat in available place', async () => {
    const [inspecteur1] = await createInspecteurs()
    const [centre1] = await createCentres()

    const placeCanBook = {
      date: getFrenchLuxonFromObject({ day: 18, hour: 9 })
        .setLocale('fr')
        .toISO(),
      inspecteur: inspecteur1._id,
      centre: centre1._id,
    }

    const place = await createPlace(placeCanBook)

    const candidat = candidatsCreatedAndUpdated[0]

    place.centre = centre1

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${place._id}`)
      .send({
        candidatId: candidat._id,
      })
      .expect(200)

    expect(getFrenchLuxonFromISO(body.place.date).toISO()).toBe(
      getFrenchLuxonFromJSDate(place.date).toISO()
    )
    expect(body.place).toHaveProperty(
      'inspecteur',
      place.inspecteur._id.toString()
    )
    expect(body.place).toHaveProperty('centre', place.centre._id.toString())
    expect(body.place).toHaveProperty('candidat', candidat._id.toString())

    const newCandidat = await findCandidatById(candidat._id)
    expect(newCandidat.places).toBeUndefined()

    expectMailConvocation(candidat, place)

    await place.remove()
  })

  it('should return a 200 when assign candidat with booked in available place', async () => {
    const [inspecteur1] = await createInspecteurs()
    const [centre1] = await createCentres()

    const placeCanBook = {
      date: getFrenchLuxonFromObject({ day: 18, hour: 9 })
        .setLocale('fr')
        .toISO(),
      inspecteur: inspecteur1,
      centre: centre1,
    }

    const place = await createPlace(placeCanBook)
    place.centre = centre1

    const candidat = candidatsCreatedAndUpdated[0]
    const placeBooked = {
      date: getFrenchLuxonFromObject({ day: 17, hour: 9 }).toISO(),
      inspecteur: inspecteur1,
      centre: centre1,
      candidat: candidat._id,
    }
    const oldResa = await createPlace(placeBooked)

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${place._id}`)
      .send({
        candidatId: candidat._id,
      })
      .expect(200)

    expect(getFrenchLuxonFromISO(body.place.date).toISO()).toBe(
      getFrenchLuxonFromJSDate(place.date).toISO()
    )
    expect(body.place).toHaveProperty(
      'inspecteur',
      place.inspecteur._id.toString()
    )
    expect(body.place).toHaveProperty('centre', place.centre._id.toString())
    expect(body.place).toHaveProperty('candidat', candidat._id.toString())

    const newCandidat = await findCandidatById(candidat._id)
    expect(newCandidat.places).toBeDefined()
    expect(newCandidat.places).toHaveLength(1)
    expect(getFrenchLuxonFromJSDate(newCandidat.places[0].date)).toEqual(
      getFrenchLuxonFromISO(placeBooked.date)
    )
    expect(newCandidat.places[0]).toHaveProperty(
      'inspecteur',
      placeBooked.inspecteur._id
    )
    expect(newCandidat.places[0]).toHaveProperty(
      'centre',
      placeBooked.centre._id
    )
    expect(newCandidat.places[0]).toHaveProperty('archivedAt')
    expect(newCandidat.places[0]).toHaveProperty(
      'archiveReason',
      REASON_MODIFY_RESA_ADMIN
    )
    expect(newCandidat.places[0]).toHaveProperty('byUser', admin.email)

    expectMailConvocation(candidat, place)

    await Promise.all([oldResa, place].map(place => place.remove()))
  })

  it('should return a 400 when place already booked', async () => {
    // Given
    const [inspecteur1] = await createInspecteurs()
    const [centre1] = await createCentres()

    const createdBookedPlace = {
      date: getFrenchLuxonFromObject({ day: 19, hour: 9 })
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

    expect(body).toHaveProperty('message', PLACE_IS_ALREADY_BOOKED)
    expect(body).toHaveProperty('success', false)
    await place.remove()
  })

  it('should return a 422 when trying to assign unexisting candidat to place', async () => {
    const [inspecteur1] = await createInspecteurs()
    const [centre1] = await createCentres()

    const createdBookedPlace = {
      date: getFrenchLuxonFromObject({ day: 20, hour: 8 }).toISO(),
      inspecteur: inspecteur1,
      centre: centre1,
    }

    const place = await createPlace(createdBookedPlace)
    const unexistingCandidatId = '5cda8d17c522ad6a16e3633b'

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${place._id}`)
      .send({
        candidatId: unexistingCandidatId,
      })
      .expect(422)

    expect(body).toHaveProperty(
      'message',
      'Les paramètres renseignés sont incorrects'
    )
    expect(body).toHaveProperty('success', false)
    await place.remove()
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
      date: getFrenchLuxonFromObject({ day: 20, hour: 9 })
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

    expect(body).toHaveProperty(
      'message',
      "Le candidat n'est pas validé par Aurige"
    )
    expect(body).toHaveProperty('success', false)
    await place.remove()
  })
})
function expectMailConvocation (candidat, place) {
  const bodyMail = require('../business/send-mail').getMail()
  expect(bodyMail).toBeDefined()
  expect(bodyMail).toHaveProperty('to', candidat.email)
  expect(bodyMail).toHaveProperty('subject', SUBJECT_CONVOCATION)
  place.candidat = candidat
  expect(bodyMail).toHaveProperty('html', getConvocationBody(place))
}

describe('delete place by admin', () => {
  const app = express()
  app.use(bodyParser.json({ limit: '20mb' }))
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

  beforeAll(async () => {
    await connect()
    setInitCreatedCentre()
    setInitCreatedPlaces()
    const user = await createUser(
      admin.email,
      admin.password,
      admin.departements,
      admin.status
    )
    app.use((req, res, next) => {
      req.userId = user._id
      next()
    })
    app.delete(`${apiPrefix}/admin/places/`, deletePlacesByAdmin)
  })

  afterAll(async () => {
    await disconnect()
  })
  it('should return a 200 when delete availables places', async () => {
    await createPlaces()
    const result = await makeCandidatsResas(bookedAt)
    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/places/`)
      .send({
        placesToDelete: [result.result1._id, result.result2._id],
      })
      .expect(200)
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', DELETE_PLACES_BY_ADMIN_SUCCESS)
  })
  it('should return a 400 when array of places to delete is empty', async () => {
    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/places/`)
      .send({
        placesToDelete: [],
      })
      .expect(422)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', DELETE_PLACES_BY_ADMIN_ERROR)
  })
})

describe('Book place and archive with bookedAt and bookedByAdmin attribut', () => {
  const centreTest = {
    departement: '93',
    nom: 'Centre 99',
    label: "Centre d'examen 2",
    adresse: '2 Avenue test, Ville test 2, FR, 93420',
    lon: 47,
    lat: 3.5,
  }

  const candidat = {
    codeNeph: '123456789003',
    nomNaissance: 'nom à tester 1',
    prenom: 'prénom à tester n°4',
    email: 'test01.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }

  const candidat2 = {
    codeNeph: '123456789004',
    nomNaissance: 'nom à tester 2',
    prenom: 'prénom à tester n°4',
    email: 'test02.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }

  const inspecteurTest = {
    nom: 'Mulder-test',
    prenom: 'Fox',
    matricule: '04710111199',
    email: 'fox.muldertest1@x-files.com',
    departement: '93',
  }

  const inspecteurTest2 = {
    nom: 'Mulder-test2',
    prenom: 'Fox',
    matricule: '04710111198',
    email: 'fox.muldertest2@x-files.com',
    departement: '93',
  }

  const adminTest = {
    email: 'test-bookedAt@example.com',
    password: 'S3cr3757uff!',
    departements: ['94', '95'],
    status: config.userStatuses.TECH,
  }

  let createdAdmin
  let createdCentre
  let createdInspecteur
  let createdInspecteur2
  let placeCreated
  let placeCreated2
  let updatedCandidat
  let updatedCandidat2
  let placeToDelete

  beforeAll(async () => {
    await connect()

    try {
      const { email, password, departements } = adminTest

      createdAdmin = await createUser(email, password, departements)

      const { nom, label, adresse, lon, lat, departement } = centreTest

      createdCentre = await createCentre(
        nom,
        label,
        adresse,
        lon,
        lat,
        departement
      )

      createdInspecteur = await createInspecteur(inspecteurTest)
      createdInspecteur2 = await createInspecteur(inspecteurTest2)

      placeCreated = await createPlace({
        date: commonBasePlaceDateTime.toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur._id,
      })

      placeCreated2 = await createPlace({
        date: commonBasePlaceDateTime.toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur2._id,
      })

      updatedCandidat = await createCandidatAndUpdate(candidat)
      updatedCandidat2 = await createCandidatAndUpdate(candidat2)
      // makeresa
      const {
        _id,
        departements: departementsAdmin,
        email: emailAdmin,
        signUpDate,
        status,
      } = createdAdmin

      const bookedByAdmin = {
        _id,
        departements: departementsAdmin,
        email: emailAdmin,
        signUpDate,
        status,
      }

      placeToDelete = await bookCandidatOnSelectedPlace(
        placeCreated2,
        updatedCandidat2,
        bookedAt,
        bookedByAdmin
      )
    } catch (e) {
      console.warn(e)
    }
    require('../middlewares/verify-token').__setIdAdmin(
      createdAdmin._id,
      createdAdmin.departements
    )
  })

  afterAll(async () => {
    try {
      await createdCentre.remove()
      await createdInspecteur.remove()
      await placeCreated.remove()
      await updatedCandidat.remove()
    } catch (e) {
      console.warn(e)
    }
    await disconnect()
  })

  it('should book place with bookedAt and bookedByAdmin', async () => {
    const placeSelected = placeCreated
    const { date, hour } = getFrenchFormattedDateTime(placeSelected.date)
    const messageToReceive = `Le candidat Nom: [${updatedCandidat.nomNaissance}] Neph: [${updatedCandidat.codeNeph}] a bien été affecté à la place du ${date} à ${hour}`

    const { body } = await request(app)
      .patch(`${apiPrefix}/admin/places/${placeSelected._id}`)
      .set('Accept', 'application/json')
      .send({
        candidatId: updatedCandidat._id,
      })
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', messageToReceive)
    expect(body).toHaveProperty('place')

    const { place } = body

    expect(place).toBeDefined()

    const placeFounded = await findPlaceById(place._id)

    expect(placeFounded).toHaveProperty('bookedAt')
    expect(placeFounded).toHaveProperty('bookedByAdmin')

    const { _id, email, signUpDate, status } = createdAdmin
    const { bookedByAdmin } = placeFounded

    expect(bookedByAdmin).toHaveProperty('_id', _id)
    expect(bookedByAdmin).toHaveProperty('departements')
    expect(bookedByAdmin).toHaveProperty('email', email)
    expect(bookedByAdmin).toHaveProperty('signUpDate', signUpDate)
    expect(bookedByAdmin).toHaveProperty('status', status)
  })

  it('should archive booked place with bookedAt and bookedByAdmin', async () => {
    const placeFounded = placeToDelete

    const { body } = await request(app)
      .delete(`${apiPrefix}/admin/places`)
      .set('Accept', 'application/json')
      .send({
        placesToDelete: [placeFounded._id],
      })
      .expect(200)

    const candidatId = placeFounded.candidat

    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', DELETE_PLACES_BY_ADMIN_SUCCESS)

    const candidatFound = await findCandidatById(candidatId)

    expect(candidatFound).toHaveProperty('resaCanceledByAdmin')
    expect(candidatFound).toHaveProperty('places')
    expect(candidatFound.places[0]).toHaveProperty('bookedAt')
    expect(candidatFound.places[0]).toHaveProperty('bookedByAdmin')
    expect(candidatFound.places[0]).toHaveProperty(
      'archiveReason',
      'REMOVE_RESA_ADMIN'
    )

    const { bookedByAdmin: bkdByAdmin } = candidatFound.places[0]
    const { _id, email, signUpDate, status } = createdAdmin

    expect(bkdByAdmin).toHaveProperty('_id', _id)
    expect(bkdByAdmin).toHaveProperty('departements')
    expect(bkdByAdmin).toHaveProperty('email', email)
    expect(bkdByAdmin).toHaveProperty('signUpDate', signUpDate)
    expect(bkdByAdmin).toHaveProperty('status', status)
  })
})
