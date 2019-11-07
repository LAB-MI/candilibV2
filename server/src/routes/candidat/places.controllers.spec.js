import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import app, { apiPrefix } from '../../app'
import {
  createCandidats,
  createCentres,
  centres,
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
import { createCentre } from '../../models/centre'

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

import { ErrorMsgArgEmpty } from './places.controllers'

jest.mock('../business/send-mail')
jest.mock('../middlewares/verify-token')
jest.mock('../../util/logger')

const bookedAt = getFrenchLuxon().toJSDate()

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
          `${apiPrefix}/candidat/places?departement=${centreSelected.departement}&centre=${centreSelected.nom}`
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

describe('book and delete reservation by candidat', () => {
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

      placeToDelete = await bookCandidatOnSelectedPlace(
        placeCreated2,
        updatedCandidat2,
        bookedAt
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
        id: placeSelected.centre,
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
    const { centre, date } = placeSelected

    const { body } = await request(app)
      .delete(`${apiPrefix}/candidat/places`)
      .set('Accept', 'application/json')
      .send({
        id: centre,
        date: date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .expect(200)
    const messageToReceive = 'Votre annulation a bien été prise en compte.'

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('statusmail', true)
    expect(body).toHaveProperty('message', messageToReceive)

    const candidatFounded = await findCandidatById(updatedCandidat2._id)
    const place = candidatFounded.places.find(
      place => place.archiveReason === 'CANCEL'
    )

    expect(place).toBeDefined()
    expect(place).toHaveProperty('bookedAt', bookedAt)
    expect(place).toHaveProperty('archiveReason', 'CANCEL')
    expect(place).toHaveProperty('date', date)
    expect(place).toHaveProperty('centre', centre)
  })
})

// TODO: fix this unit test
const basePlaceDateTime = getFrenchLuxonFromObject({ hour: 9 })
const placeCanBook = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.delayToBook + 1, hour: 1 })
      .toISO())(),
  centre: 'Centre 1',
  inspecteur: 'Inspecteur 2',
}
const placeCanBook2 = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.delayToBook + 2, hour: 1 })
      .toISO())(),
  centre: 'Centre 2',
  inspecteur: 'Inspecteur 2',
}
const placeBeforeNow = {
  date: (() => basePlaceDateTime.minus({ days: 1, hour: 1 }).toISO())(),
  centre: 'Centre 1',
  inspecteur: 'Inspecteur 2',
}
const placeCanNotBook = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.delayToBook - 1, hour: 1 })
      .toISO())(),
  centre: 'Centre 2',
  inspecteur: 'Inspecteur 2',
}
const placeCancellable = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.daysForbidCancel + 1, hour: 1 })
      .toISO())(),
  centre: 'Centre 2',
  inspecteur: 'Inspecteur 2',
}
const placeNoCancellable = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.daysForbidCancel - 1, hour: 2 })
      .toISO())(),
  centre: 'Centre 2',
  inspecteur: 'Inspecteur 2',
}
const placeToRetry = {
  date: (() =>
    basePlaceDateTime
      .plus({ days: config.timeoutToRetry + config.delayToBook, hour: 1 })
      .toISO())(),
  centre: 'Centre 2',
  inspecteur: 'Inspecteur 2',
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
  dateDernierEchecPratique: dateDernierEchecPratique().toISO(),
  canBookFrom: dateEchecCanBookFrom().toISO(),
}

xdescribe('Test reservation controllers WIP', () => {
  let createdCentres
  let createdCandiats
  let createdPlaceCanBook
  let createdPlaceCanBook2
  let selectedCandidat
  let createdPlaceBeforeNow
  let createdPlaceCanNotBook
  let createdPlaceToRetry
  let createdCandidatFailed
  beforeAll(async () => {
    await connect()
    createdCandidatFailed = await createCandidat(candidatFailed)
    createdCandiats = await createCandidats()
    createdCentres = await createCentres()
    createdPlaceBeforeNow = await createTestPlace(placeBeforeNow)
    createdPlaceCanBook = await createTestPlace(placeCanBook)
    createdPlaceCanBook2 = await createTestPlace(placeCanBook2)
    createdPlaceCanNotBook = await createTestPlace(placeCanNotBook)
    createdPlaceToRetry = await createTestPlace(placeToRetry)

    selectedCandidat = createdCandiats[0]
    require('../middlewares/verify-token').__setIdCandidat(selectedCandidat._id)
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()

    await disconnect()
    await app.close()
  })

  const createReservationWithFailure = async (
    selectedCentre,
    selectedPlace,
    previewDate,
    offsetDate
  ) => {
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
          })
        ).date
    )
  }

  const createReservationWithSuccess = async (
    selectedCentre,
    selectedPlace,
    previewsPlaceId
  ) => {
    const { body } = await request(app)
      .post(`${apiPrefix}/candidat/reservations`)
      .send({
        id: selectedCentre._id,
        date: selectedPlace.date,
        isAccompanied: true,
        hasDualControlCar: true,
      })
      .set('Accept', 'application/json')
      .expect(201)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('statusmail', true)
    expect(body).toHaveProperty('message', SAVE_RESA_WITH_MAIL_SENT)
    expect(body).toHaveProperty('reservation')
    expect(body.reservation).toHaveProperty(
      'date',
      getFrenchLuxonFromJSDate(selectedPlace.date)
        .setZone('utc')
        .toISO()
    )
    expect(body.reservation).toHaveProperty('centre', selectedCentre.nom)
    expect(body.reservation).toHaveProperty(
      'departement',
      selectedCentre.departement
    )
    expect(body.reservation).not.toHaveProperty('inspecteur')

    if (previewsPlaceId) {
      const previewPlace = await findPlaceById(previewsPlaceId)
      expect(previewPlace).toBeDefined()
      expect(previewPlace.candidat).toBeUndefined()
    }
  }

  const cancelReservationWithSuccess = async (
    selectedCandidatId,
    previewPlaceId,
    message,
    hasCanBookFrom
  ) => {
    const { body } = await request(app)
      .delete(`${apiPrefix}/candidat/reservations`)
      .set('Accept', 'application/json')
      .expect(200)

    expect(body).toBeDefined()
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('statusmail', true)
    expect(body).toHaveProperty('message', message)

    const previewPlace = await findPlaceById(previewPlaceId)
    expect(previewPlace).toBeDefined()
    expect(previewPlace.candidat).toBeUndefined()

    const candidat = await findCandidatById(selectedCandidatId)
    expect(candidat).toBeDefined()

    if (hasCanBookFrom) {
      expect(candidat).toHaveProperty('canBookFrom')
    } else {
      expect(candidat.canBookFrom).toBeUndefined()
    }
    expect(candidat.places).toBeDefined()
    expect(candidat.places.length).toBeGreaterThan(0)

    const foundPlace = candidat.places.find(
      pPlace => pPlace._id.toString() === previewPlace._id.toString()
    )

    expect(foundPlace).toBeDefined()
    expect(foundPlace).toHaveProperty('inspecteur', previewPlace.inspecteur)
    expect(foundPlace).toHaveProperty('centre', previewPlace.centre)
    expect(foundPlace).toHaveProperty('date', previewPlace.date)
    expect(foundPlace.archivedAt).toBeDefined()
    expect(foundPlace).toHaveProperty('archiveReason', REASON_CANCEL)
  }

  describe('get reservation', () => {
    beforeAll(async () => {
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat._id
      )
      await makeResa(createdPlaceCanBook, selectedCandidat, bookedAt)
    })
    afterAll(async () => {
      await removeAllResas()
    })

    it('Should get 200 to send mail of convocation', async () => {
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/reservations?bymail=true`)
        .set('Accept', 'application/json')
        .expect(200)

      expect(body).toBeDefined()
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('message', SEND_MAIL_ASKED)
    })

    it('Should get 200 to get the candidat reservation', async () => {
      await makeResa(createdPlaceCanBook, selectedCandidat, bookedAt)
      const selectedCentre = createdCentres[0]
      const selectedPlace = createdPlaceCanBook

      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/reservations`)
        .set('Accept', 'application/json')
        .expect(200)

      const dateTimeResa = getFrenchLuxonFromJSDate(selectedPlace.date)

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
      expect(body.candidat).toBeUndefined()
      expect(body).toHaveProperty(
        'lastDateToCancel',
        dateTimeResa.minus({ days: config.daysForbidCancel }).toISODate()
      )
      expect(body.dateDernierEchecPratique).toBeUndefined()
      expect(body.canBookFrom).toBeUndefined()
      expect(body.timeOutToRetry).toBe(config.timeoutToRetry)
      expect(body.dayToForbidCancel).toBe(config.daysForbidCancel)
    })
  })

  describe('Book a place', () => {
    describe('book with the date authorize', () => {
      afterEach(async () => {
        await removeAllResas()
      })

      it('Should get 400 to book one place before now', async () => {
        const selectedCentre = createdCentres[0]
        const selectedPlace = createdPlaceBeforeNow
        await createReservationWithFailure(
          selectedCentre,
          selectedPlace,
          getFrenchLuxon(),
          config.delayToBook
        )
      })

      it('Should get 200 to book one place', async () => {
        const selectedCentre = createdCentres[0]
        const selectedPlace = createdPlaceCanBook

        await createReservationWithSuccess(selectedCentre, selectedPlace)
      })

      it('Should get 200 to book another place', async () => {
        await makeResa(createdPlaceCanBook, selectedCandidat, bookedAt)

        const selectedCentre = createdCentres[1]
        const selectedPlace = createdPlaceCanBook2
        const previewPlaceId = createdPlaceCanBook._id

        await createReservationWithSuccess(
          selectedCentre,
          selectedPlace,
          previewPlaceId
        )
      })

      it('Should get 400 to book a same place', async () => {
        await makeResa(createdPlaceCanBook2, selectedCandidat, bookedAt)

        const selectedCentre = createdCentres[1]
        const selectedPlace = createdPlaceCanBook2

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
    })

    describe('modify a reservation in 6 days', () => {
      beforeAll(async () => {
        require('../middlewares/verify-token').__setIdCandidat(
          selectedCandidat._id
        )
        await makeResa(createdPlaceCanNotBook, selectedCandidat, bookedAt)
      })
      afterAll(async () => {
        await removeAllResas()
      })

      it('should 400 to book another reservation with a date no authorize', async () => {
        const selectedCentre = createdCentres[0]
        const selectedPlace = createdPlaceCanBook
        await createReservationWithFailure(
          selectedCentre,
          selectedPlace,
          createdPlaceCanNotBook.date,
          config.timeoutToRetry
        )
      })

      it('should 200 to book another reservation with a place after time to retry', async () => {
        const selectedCentre = createdCentres[1]
        const selectedPlace = createdPlaceToRetry

        await createReservationWithSuccess(
          selectedCentre,
          selectedPlace,
          createdPlaceCanNotBook._id
        )
      })
    })
  })

  describe('Cancel a reservation', () => {
    let selectedCandidat1
    beforeAll(async () => {
      selectedCandidat1 = createdCandiats[1]
      require('../middlewares/verify-token').__setIdCandidat(
        selectedCandidat1._id
      )
    })
    afterEach(async () => {
      await removeAllResas()
    })
    it('Should get 200 to cancel a reservation without penalty', async () => {
      const place = await createTestPlace(placeCancellable)
      await makeResa(place, selectedCandidat1, bookedAt)

      await cancelReservationWithSuccess(
        selectedCandidat1._id,
        place._id,
        CANCEL_RESA_WITH_MAIL_SENT
      )
    })

    it('Should get 200 to cancel a reservation with penalty', async () => {
      const place = await createTestPlace(placeNoCancellable)
      await makeResa(place, selectedCandidat1, bookedAt)

      const message =
        CANCEL_RESA_WITH_MAIL_SENT +
        ' ' +
        CAN_BOOK_AFTER +
        getFrenchFormattedDateTime(
          getFrenchLuxonFromJSDate(place.date)
            .endOf('day')
            .plus({
              days: config.timeoutToRetry,
            })
        ).date

      await cancelReservationWithSuccess(
        selectedCandidat1._id,
        place._id,
        message,
        true
      )
    })
  })

  describe('get reservation with candidat failed', () => {
    beforeAll(async () => {
      require('../middlewares/verify-token').__setIdCandidat(
        createdCandidatFailed._id
      )
      createdCandidatFailed = await updateCandidatFailed(
        createdCandidatFailed,
        candidatFailed
      )
      await makeResa(createdPlaceToRetry, createdCandidatFailed, bookedAt)
    })
    afterAll(async () => {
      await removeAllResas()
    })

    it('Should get 200 to get reservation from the candidat failed ', async () => {
      const selectedPlace = createdPlaceToRetry
      const selectedCentre = createdCentres[1]
      const { body } = await request(app)
        .get(`${apiPrefix}/candidat/reservations`)
        .set('Accept', 'application/json')
        .expect(200)

      const dateTimeResa = getFrenchLuxonFromJSDate(selectedPlace.date)
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
      expect(body.candidat).toBeUndefined()
      expect(body).toHaveProperty(
        'lastDateToCancel',
        dateTimeResa.minus({ days: config.daysForbidCancel }).toISODate()
      )
      expect(body.dateDernierEchecPratique).toBe(
        dateDernierEchecPratique()
          .setZone('utc')
          .toISO()
      )
      expect(body.canBookFrom).toBe(
        dateEchecCanBookFrom()
          .setZone('utc')
          .toISO()
      )
      expect(body.timeOutToRetry).toBe(config.timeoutToRetry)
      expect(body.dayToForbidCancel).toBe(config.daysForbidCancel)
    })
  })
})
