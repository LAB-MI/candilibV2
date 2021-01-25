import request from 'supertest'
import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import {
  createCandidats,
  createCentres,
  centres as centresTests,
  createPlaces,
  createTestPlace,
  deleteCandidats,
  makeResa,
  makeResas,
  removeAllResas,
  removeCentres,
  removePlaces,
  bookCandidatOnSelectedPlace,
  createCandidatAndUpdate,
  commonBasePlaceDateTime,
  inspecteursTests,
  createInspecteurs,
  setInitCreatedCentre,
  resetCreatedInspecteurs,
  setInitCreatedPlaces,
  dateYesterday,
} from '../../models/__tests__'
import {
  SAVE_RESA_WITH_MAIL_SENT,
  CANCEL_RESA_WITH_MAIL_SENT,
  SAME_RESA_ASKED,
  SEND_MAIL_ASKED,
  CAN_BOOK_AFTER,
} from './message.constants'
import {
  findPlaceById,
  createPlace,
  findPlaceByCandidatId,
} from '../../models/place'
import config from '../../config'
import { createInspecteur } from '../../models/inspecteur'
import { createCentre, findCentreById } from '../../models/centre'

import {
  findCandidatById,
  createCandidat,
  updateCandidatFailed,
} from '../../models/candidat'

import { REASON_CANCEL } from '../common/reason.constants'

import {
  getFrenchFormattedDateTime,
  getFrenchLuxon,
  getFrenchLuxonFromJSDate,
  getFrenchLuxonFromObject,
} from '../../util'

import {
  expectMailConvocation,
  expectMailCancelBooking,
} from '../business/__tests__/expect-send-mail'

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')
jest.mock('../../util/token')
jest.mock('../middlewares/verify-user')

const bookedAt = getFrenchLuxon().toJSDate()

require('../../util/logger').setWithConsole(false)

const cancelReservationWithSuccess = async (
  selectedCandidatId,
  previewPlaceId,
  message,
  hasCanBookFrom,
) => {
  const { body } = await request(app)
    .delete(`${apiPrefix}/candidat/places`)
    .set('Accept', 'application/json')
    .expect(200)

  expect(body).toBeDefined()
  expect(body).toHaveProperty('success', true)
  expect(body).toHaveProperty('statusmail', true)

  const previewPlace = await findPlaceById(previewPlaceId)
  expect(previewPlace).toBeDefined()
  expect(previewPlace.candidat).toBeUndefined()

  const candidat = await findCandidatById(selectedCandidatId)
  expect(candidat).toBeDefined()

  if (hasCanBookFrom) {
    const expectedCanBookFrom = getFrenchLuxonFromJSDate(previewPlace.date)
      .endOf('day')
      .plus({
        days: config.timeoutToRetry,
      })

    expect(body).toHaveProperty('message',
      CANCEL_RESA_WITH_MAIL_SENT +
      ' ' +
      CAN_BOOK_AFTER +
      getFrenchFormattedDateTime(
        expectedCanBookFrom,
      ).date,
    )
    expect(candidat).toHaveProperty('canBookFrom', expectedCanBookFrom.toJSDate())
    expect(candidat).toHaveProperty('status', '5')
  } else {
    expect(body).toHaveProperty('message', message)
    expect(candidat.canBookFrom).toBeUndefined()
  }
  expect(candidat.places).toBeDefined()
  expect(candidat.places.length).toBeGreaterThan(0)

  const foundPlace = candidat.places.find(
    pPlace => pPlace._id.toString() === previewPlace._id.toString(),
  )

  expect(foundPlace).toBeDefined()
  expect(foundPlace).toHaveProperty('inspecteur', previewPlace.inspecteur)
  expect(foundPlace).toHaveProperty('centre', previewPlace.centre._id)
  expect(foundPlace).toHaveProperty('date', previewPlace.date)
  expect(foundPlace.archivedAt).toBeDefined()
  expect(foundPlace).toHaveProperty('archiveReason', REASON_CANCEL)
  const place = foundPlace
  place.centre = previewPlace.centre
  await expectMailCancelBooking(candidat, place)
}

describe('Test get dates from places available', () => {
  let createdCentres
  let createdPlaces
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()

    await connect()
    const createdCandidats = await createCandidats()
    createdCentres = await createCentres()
    createdPlaces = await createPlaces()
    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id,
    )
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
    await app.close()
  })

  it('should 200 without booking and information to custom the front', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('timeOutToRetry', config.timeoutToRetry)
    expect(body).toHaveProperty('dayToForbidCancel', config.daysForbidCancel)
  })

  it('Should 200 with 2 dates from places Centre 2', async () => {
    const centreSelected = centresTests[1]
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places?geoDepartement=${centreSelected.geoDepartement}&nomCentre=${centreSelected.nom}`,
      )
      .set('Accept', 'application/json')
      .expect(200)
    expect(body).toBeDefined()

    const centreId = createdCentres.find(
      centre => centre.nom === centreSelected.nom,
    )
    expect(body).toHaveLength(
      createdPlaces.filter(
        place =>
          place.centre._id === centreId._id &&
          place.visibleAt < getFrenchLuxon(),
      ).length,
    )
  })
})

describe('Test get dates from places available when there are booked', () => {
  let createdCentres
  let createdPlaces
  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()
    await connect()
    const createdCandidats = await createCandidats()
    createdCentres = await createCentres()
    createdPlaces = await createPlaces()

    await makeResas()

    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidats[0]._id,
    )
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
    await app.close()
  })

  it('Should 200 with an available place for centre 2 at a day 19 11h', async () => {
    const centreSelected = createdCentres.find(
      centre => centre.nom === centresTests[1].nom,
    )._id
    const date = createdPlaces[2].date
    const placeSelected = encodeURIComponent(date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/${centreSelected}?dateTime=${placeSelected}`,
      )

      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(1)
    expect(body[0]).toBe(getFrenchLuxonFromJSDate(date).toISO())
  })

  it('Should 200 without places because the seleted place is booked', async () => {
    const centreSelected = createdCentres.find(
      centre => centre.nom === centresTests[1].nom,
    )._id
    const placeSelected = encodeURIComponent(createdPlaces[1].date)
    const { body } = await request(app)
      .get(
        `${apiPrefix}/candidat/places/${centreSelected}?dateTime=${placeSelected}`,
      )
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveLength(0)
  })
})

describe('Test to book and to delete reservation by candidat', () => {
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
    nomNaissance: 'nom à tester 4',
    prenom: 'prénom à tester n°4',
    email: 'test4.testbookedAt1@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '93',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }

  const candidat2 = {
    codeNeph: '123456789003',
    nomNaissance: 'nom à tester 99',
    prenom: 'prénom à tester n°4',
    email: 'test4.testbookedAt2@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    departement: '93',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }

  const inspecteurTest = {
    nom: 'Mulder-test',
    prenom: 'Fox',
    matricule: '04710111166',
    email: 'fox.mulder.bookedAt1@x-files.com',
    departement: '93',
  }

  const inspecteurTest2 = {
    nom: 'Mulder-test',
    prenom: 'Fox',
    matricule: '04710111177',
    email: 'fox.mulder.bookedAt2@x-files.com',
    departement: '93',
  }

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
      const { nom, label, adresse, lon, lat, departement } = centreTest

      createdCentre = await createCentre(
        nom,
        label,
        adresse,
        lon,
        lat,
        departement,
      )

      createdInspecteur = await createInspecteur(inspecteurTest)
      createdInspecteur2 = await createInspecteur(inspecteurTest2)

      placeCreated = await createPlace({
        date: commonBasePlaceDateTime.toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur._id,
        createdAt: dateYesterday,
        visibleAt: dateYesterday,
      })

      placeCreated2 = await createPlace({
        date: commonBasePlaceDateTime.toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur2._id,
        createdAt: dateYesterday,
        visibleAt: dateYesterday,
      })

      updatedCandidat = await createCandidatAndUpdate(candidat)
      updatedCandidat2 = await createCandidatAndUpdate(candidat2)

      placeToDelete = await bookCandidatOnSelectedPlace(
        placeCreated2,
        updatedCandidat2,
        bookedAt,
      )
    } catch (e) {
      console.warn(e)
    }
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
    await app.close()
  })

  it('should booked place by candidat with info bookedAt', async () => {
    require('../middlewares/verify-token').__setIdCandidat(updatedCandidat._id)

    const placeSelected = placeCreated
    const messageToReceive =
      "Votre réservation à l'examen a été prise en compte. Veuillez consulter votre boîte mail."

    const { body } = await request(app)
      .patch(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .send({
        nomCentre: createdCentre.nom,
        geoDepartement: createdCentre.geoDepartement,
        date: placeSelected.date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('statusmail', true)
    expect(body).toHaveProperty('message', messageToReceive)

    const placefounded = await findPlaceByCandidatId(updatedCandidat._id)

    expect(placefounded).toBeDefined()
    expect(placefounded).toHaveProperty('bookedAt')
    expect(placefounded).toHaveProperty('date', placeSelected.date)
    expect(placefounded).toHaveProperty('centre', placeSelected.centre)
  })

  it('should delete booked place and archive place with info bookedAt', async () => {
    require('../middlewares/verify-token').__setIdCandidat(updatedCandidat2._id)

    const placeSelected = placeToDelete

    const messageToReceive = 'Votre annulation a bien été prise en compte.'
    await cancelReservationWithSuccess(updatedCandidat2._id,
      placeSelected._id,
      messageToReceive,
      true)

    // To display places at 12h
    const placeUpdated = await findPlaceById(placeSelected._id)
    expect(placeUpdated).toHaveProperty('visibleAt')
    const visibleAt = getFrenchLuxonFromJSDate(placeUpdated.visibleAt).set({ millisecond: 0 })
    const now = getFrenchLuxon()
    const expectedBaseVisbleAt = getFrenchLuxonFromObject({ hour: 12, minute: 0, second: 0 })
    const expectVisibleAt = now.hour < 12 ? expectedBaseVisbleAt : expectedBaseVisbleAt.plus({ days: 1 })
    expect(visibleAt).toEqual(expectVisibleAt)
  })
})

// TODO: fix this unit test
const basePlaceDateTime = getFrenchLuxonFromObject({ hour: 9 })
const placeCanBook = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.delayToBook + 1, hour: 1 })
      .toISO())(),
  centre: centresTests[1],
  inspecteur: inspecteursTests[1],
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}
const placeCanBook2 = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.delayToBook + 2, hour: 1 })
      .toISO())(),
  centre: centresTests[1],
  inspecteur: inspecteursTests[1],
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}
const placeBeforeNow = {
  date: (() => basePlaceDateTime.minus({ days: 1, hour: 1 }).toISO())(),
  centre: centresTests[1].nom,
  inspecteur: inspecteursTests[1],
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}
const placeCanNotBook = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.delayToBook - 1, hour: 1 })
      .toISO())(),
  centre: centresTests[1].nom,
  inspecteur: inspecteursTests[1],
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}

const placeCancellable = {
  date: (() =>
    getFrenchLuxon()
      .plus({ days: config.daysForbidCancel, hour: -1 })
      .toISO())(),
  centre: centresTests[1].nom,
  inspecteur: inspecteursTests[1].nom,
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}
const placeNoCancellable = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.daysForbidCancel, hour: -24 })
      .toISO())(),
  centre: centresTests[1].nom,
  inspecteur: inspecteursTests[1].nom,
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}

const placeToRetry = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.timeoutToRetry + config.delayToBook, hour: 1 })
      .toISO())(),
  centre: centresTests[1].nom,
  inspecteur: inspecteursTests[1].nom,
  createdAt: dateYesterday,
  visibleAt: dateYesterday,
}
const dateDernierEchecPratique = () => basePlaceDateTime.plus({ hour: 2 })
const dateEchecCanBookFrom = () => basePlaceDateTime.plus({ days: 45, hour: 2 })

const candidatFailed = {
  codeNeph: '123456789004',
  nomNaissance: 'Nom à tester',
  prenom: 'Prénom à tester n°4',
  email: 'test4.test@test.com',
  portable: '0612345678',
  adresse: '10 Rue Oberkampf 75011 Paris',
  departement: '93',
  dateDernierEchecPratique: dateDernierEchecPratique().toISO(),
  canBookFrom: dateEchecCanBookFrom().toISO(),
}

describe('test to get booking by candidat', () => {
  let selectedCandidat
  let createdPlaceCanBook
  let createdCentres

  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()
    await connect()
    const createdCandiats = await createCandidats()
    selectedCandidat = createdCandiats[0]
    createdCentres = await createCentres()
    await createInspecteurs()
    createdPlaceCanBook = await createTestPlace(placeCanBook)

    require('../middlewares/verify-token').__setIdCandidat(selectedCandidat._id)
    await makeResa(createdPlaceCanBook, selectedCandidat, bookedAt)
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()

    await disconnect()
    await app.close()
  })

  it('Should get 200 to send mail of convocation', async () => {
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/places?byMail=true`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('message', SEND_MAIL_ASKED)

    const { centre } = createdPlaceCanBook
    if (!centre.nom) {
      createdPlaceCanBook.centre = await findCentreById(centre && centre._id)
    }

    await expectMailConvocation(selectedCandidat, createdPlaceCanBook)
  })

  it('Should get 200 to get the candidat reservation', async () => {
    const selectedCentre = createdCentres[1]
    const selectedPlace = createdPlaceCanBook

    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .expect(200)

    const dateTimeResa = getFrenchLuxonFromJSDate(selectedPlace.date)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('date', dateTimeResa.setZone('utc').toISO())
    expect(body.centre).toBeDefined()
    expect(body.centre).toHaveProperty('nom', selectedCentre.nom)
    expect(body.centre).toHaveProperty(
      'departement',
      selectedCentre.departement,
    )
    expect(body.centre).toHaveProperty('adresse', selectedCentre.adresse)
    expect(body.inspecteur).toBeUndefined()
    expect(body.candidat).toBeUndefined()
    expect(body).toHaveProperty(
      'lastDateToCancel',
      dateTimeResa.minus({ days: config.daysForbidCancel }).toISODate(),
    )
    expect(body.dateDernierEchecPratique).toBeUndefined()
    expect(body.canBookFrom).toBeUndefined()
    expect(body.timeOutToRetry).toBe(config.timeoutToRetry)
    expect(body.dayToForbidCancel).toBe(config.daysForbidCancel)
  })
})

const createReservationWithFailure = async (
  selectedCentre,
  selectedPlace,
  previewDate,
  offsetDate,
  isModification = true,
) => {
  const { body } = await request(app)
    .patch(`${apiPrefix}/candidat/places`)
    .send({
      nomCentre: selectedCentre.nom,
      geoDepartement: selectedCentre.geoDepartement,
      date: selectedPlace.date,
      isAccompanied: true,
      hasDualControlCar: true,
      isModification,
    })
    .set('Accept', 'application/json')
    .expect(400)

  let datetimeAuthorize
  if (previewDate instanceof Date) {
    datetimeAuthorize = getFrenchLuxonFromJSDate(previewDate).endOf('day')
  } else {
    datetimeAuthorize = previewDate.endOf('day')
  }
  expect(body).toBeDefined()
  expect(body).toHaveProperty('success', false)
  expect(body).toHaveProperty(
    'message',
    CAN_BOOK_AFTER +
      getFrenchFormattedDateTime(
        datetimeAuthorize.plus({
          days: offsetDate,
        }),
      ).date,
  )

  const bodyMail = require('../business/send-mail').getMail()
  expect(bodyMail).toBeUndefined()
}

const createReservationWithSuccess = async (
  selectedCentre,
  selectedPlace,
  previewsPlaceId,
  selectedCandidat,
  isModification = true,
) => {
  const { body } = await request(app)
    .patch(`${apiPrefix}/candidat/places`)
    .send({
      nomCentre: selectedCentre.nom,
      geoDepartement: selectedCentre.geoDepartement,
      date: selectedPlace.date,
      isAccompanied: true,
      hasDualControlCar: true,
      isModification,
    })
    .set('Accept', 'application/json')
    .expect(200)
  expect(body).toBeDefined()
  expect(body).toHaveProperty('success', true)
  if (isModification) {
    expect(body).toHaveProperty('message', 'Vous avez un réservation en cours. Vous devrez annuler votre réservation pour en réserver un autre.')
    return
  }
  expect(body).toHaveProperty('statusmail', true)
  expect(body).toHaveProperty('message', SAVE_RESA_WITH_MAIL_SENT)
  expect(body).toHaveProperty('reservation')
  expect(body.reservation).toHaveProperty(
    'date',
    getFrenchLuxonFromJSDate(selectedPlace.date)
      .setZone('utc')
      .toISO(),
  )
  expect(body.reservation).toHaveProperty('centre', selectedCentre.nom)
  expect(body.reservation).toHaveProperty(
    'departement',
    selectedCentre.departement,
  )
  expect(body.reservation).not.toHaveProperty('inspecteur')

  if (previewsPlaceId) {
    const previewPlace = await findPlaceById(previewsPlaceId)
    expect(previewPlace).toBeDefined()
    expect(previewPlace.candidat).toBeUndefined()
  }
  const place = await selectedPlace.populate('centre').execPopulate()

  const newSelectedCandidat = await findCandidatById(selectedCandidat._id)
  expect(newSelectedCandidat).toHaveProperty(
    'departement',
    selectedCentre.departement,
  )

  await expectMailConvocation(newSelectedCandidat, place)
}

describe('test to book with the date authorize by candiat', () => {
  let selectedCandidat
  let createdCentres
  beforeAll(async () => {
    await connect()
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()
    const createdCandiats = await createCandidats()
    selectedCandidat = createdCandiats[0]
    createdCentres = await createCentres()
    await createInspecteurs()

    require('../middlewares/verify-token').__setIdCandidat(selectedCandidat._id)
  })

  beforeEach(() => {
    require('../business/send-mail').__initMail()
  })
  afterEach(async () => {
    await removePlaces()
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()

    await disconnect()
    await app.close()
  })

  it('Should get 400 to book one place before now', async () => {
    const selectedCentre = createdCentres[1]
    const selectedPlace = await createTestPlace(placeBeforeNow)
    await createReservationWithFailure(
      selectedCentre,
      selectedPlace,
      getFrenchLuxon(),
      config.delayToBook,
      false,
    )
  })

  it('Should get 200 to book one place', async () => {
    const selectedCentre = createdCentres[0]
    const placeCanBook1 = {
      ...placeCanBook,
      centre: selectedCentre,
    }
    const selectedPlace = await createTestPlace(placeCanBook1)
    await createReservationWithSuccess(
      selectedCentre,
      selectedPlace,
      undefined,
      selectedCandidat,
      false,
    )
  })

  it('Should get 200 to book another place', async () => {
    const selectedPlace = await createTestPlace(placeCanBook2)
    const createdPlaceCanBook = await createTestPlace(placeCanBook)
    await makeResa(createdPlaceCanBook, selectedCandidat, bookedAt)

    const selectedCentre = createdCentres[1]
    const previewPlaceId = createdPlaceCanBook._id
    await createReservationWithSuccess(
      selectedCentre,
      selectedPlace,
      previewPlaceId,
      selectedCandidat,
    )
  })

  // TODO: A supprimer dans le v2.10.0
  xit('Should get 400 to book a same place', async () => {
    const selectedPlace = await createTestPlace(placeCanBook)
    await makeResa(selectedPlace, selectedCandidat, bookedAt)
    const { body } = await request(app)
      .patch(`${apiPrefix}/candidat/places`)
      .send({
        nomCentre: placeCanBook.centre.nom,
        geoDepartement: placeCanBook.centre.geoDepartement,
        date: selectedPlace.date,
        isAccompanied: true,
        hasDualControlCar: true,
        isModification: true,
      })
      .set('Accept', 'application/json')
      .expect(400)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', SAME_RESA_ASKED)
    expect(body).not.toHaveProperty('statusmail')
    expect(body).not.toHaveProperty('reservation')

    const bodyMail = require('../business/send-mail').getMail()
    expect(bodyMail).toBeUndefined()
  })
})

describe('test to change a booking, 6 days before the appointemnt, by candidat ', () => {
  let createdCandiats
  let selectedCandidat
  let createdPlaceCanNotBook
  let createdCentres

  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()
    await connect()
    createdCandiats = await createCandidats()
    createdCentres = await createCentres()
    await createInspecteurs()
    selectedCandidat = createdCandiats[0]
    require('../middlewares/verify-token').__setIdCandidat(selectedCandidat._id)
  })

  beforeEach(async () => {
    createdPlaceCanNotBook = await createTestPlace(placeCanNotBook)

    await makeResa(createdPlaceCanNotBook, selectedCandidat, bookedAt)
  })

  afterEach(async () => {
    await removePlaces()
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()

    await disconnect()
    await app.close()
  })

  // TODO: A supprimer dans le v2.10.0
  xit('should 400 to book another reservation with a date no authorize', async () => {
    const selectedCentre = createdCentres[1]
    const selectedPlace = await createTestPlace(placeCanBook)

    await createReservationWithFailure(
      selectedCentre,
      selectedPlace,
      createdPlaceCanNotBook.date,
      config.timeoutToRetry,
    )
  })

  it('should 200 to book another reservation with a place after time to retry', async () => {
    const selectedCentre = createdCentres[1]
    const selectedPlace = await createTestPlace(placeToRetry)

    await createReservationWithSuccess(
      selectedCentre,
      selectedPlace,
      createdPlaceCanNotBook._id,
      selectedCandidat,
    )
  })
})

describe('Cancel a reservation', () => {
  let selectedCandidat1

  beforeAll(async () => {
    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()
    await connect()
    const createdCandiats = await createCandidats()
    await createCentres()
    await createInspecteurs()
    selectedCandidat1 = createdCandiats[1]
    require('../middlewares/verify-token').__setIdCandidat(
      selectedCandidat1._id,
    )
  })
  afterEach(async () => {
    await removeAllResas()
  })
  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()

    await disconnect()
    await app.close()
  })
  /**
 * @deprecated v2.10.0 une annulation une pénalité
 */
  xit('Should get 200 to cancel a reservation without penalty', async () => {
    const place = await createTestPlace(placeCancellable)
    await makeResa(place, selectedCandidat1, bookedAt)

    await cancelReservationWithSuccess(
      selectedCandidat1._id,
      place._id,
      CANCEL_RESA_WITH_MAIL_SENT,
    )
  })

  it('Should get 200 to cancel a reservation with penalty', async () => {
    const place = await createTestPlace(placeNoCancellable)
    await makeResa(place, selectedCandidat1, bookedAt)

    const message = ''

    await cancelReservationWithSuccess(
      selectedCandidat1._id,
      place._id,
      message,
      true,
    )
  })
})

describe('get reservation with candidat failed', () => {
  let createdCandidatFailed
  let createdPlaceToRetry
  let createdCentres

  beforeAll(async () => {
    await connect()

    setInitCreatedCentre()
    resetCreatedInspecteurs()
    setInitCreatedPlaces()

    createdCentres = await createCentres()
    await createInspecteurs()
    createdCandidatFailed = await createCandidat(candidatFailed)
    createdPlaceToRetry = await createTestPlace(placeToRetry)

    require('../middlewares/verify-token').__setIdCandidat(
      createdCandidatFailed._id,
    )
    createdCandidatFailed = await updateCandidatFailed(
      createdCandidatFailed,
      candidatFailed,
    )
    await makeResa(createdPlaceToRetry, createdCandidatFailed, bookedAt)
  })
  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()

    await disconnect()
    await app.close()
  })

  it('Should get 200 to get reservation from the candidat failed ', async () => {
    const selectedPlace = createdPlaceToRetry
    const selectedCentre = createdCentres[1]
    const { body } = await request(app)
      .get(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .expect(200)

    const dateTimeResa = getFrenchLuxonFromJSDate(selectedPlace.date)
    expect(body).toBeDefined()
    expect(body).toHaveProperty('date', dateTimeResa.setZone('utc').toISO())
    expect(body.centre).toBeDefined()
    expect(body.centre).toHaveProperty('nom', selectedCentre.nom)
    expect(body.centre).toHaveProperty(
      'departement',
      selectedCentre.departement,
    )
    expect(body.centre).toHaveProperty('adresse', selectedCentre.adresse)
    expect(body.inspecteur).toBeUndefined()
    expect(body.candidat).toBeUndefined()
    expect(body).toHaveProperty(
      'lastDateToCancel',
      dateTimeResa.minus({ days: config.daysForbidCancel }).toISODate(),
    )
    expect(body.dateDernierEchecPratique).toBe(
      dateDernierEchecPratique()
        .setZone('utc')
        .toISO(),
    )
    expect(body.canBookFrom).toBe(
      dateEchecCanBookFrom()
        .setZone('utc')
        .toISO(),
    )
    expect(body.timeOutToRetry).toBe(config.timeoutToRetry)
    expect(body.dayToForbidCancel).toBe(config.daysForbidCancel)
  })
})
