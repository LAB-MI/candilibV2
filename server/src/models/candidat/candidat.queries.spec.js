import {
  createCandidat,
  updateCandidatEmail,
  deleteCandidat,
  deleteCandidatByNomNeph,
  findCandidatByNomNeph,
  findBookedCandidats,
  updateCandidatSignUp,
  countCandidatsInscritsByDepartementAndWeek,
} from './'

import { connect, disconnect } from '../../mongo-connection'

import {
  commonBasePlaceDateTime,
  createCandidats,
  createCentres,
  createPlaces,
  deleteCandidats,
  makeResas,
  removeCentres,
  removePlaces,
  createCandidatAndUpdate,
} from '../__tests__'
import {
  archivePlace,
  updateCandidatFailed,
  updateCandidatNoReussite,
} from './candidat.queries'
import {
  REASON_CANCEL,
  REASON_EXAM_FAILED,
  REASON_REMOVE_RESA_ADMIN,
} from '../../routes/common/reason.constants'

import { getFrenchLuxon } from '../../util'
import { ABSENT, ECHEC } from './objetDernierNonReussite.values'

const validEmail = 'candidat@example.com'
const anotherValidEmail = 'candidat@example.fr'
const invalidEmail = 'candidatexample.com'
const portable = '0612345678'
const adresse = '10 Rue Hoche 93420 Villepinte'
const nomNaissance = 'Dupont'
const autreNomNaissance = 'Dupond'
const prenom = 'Jean'
const codeNeph = '123456789012'
const autreCodeNeph = '123456789013'

const validEmail1 = 'test@example.com'
const portable1 = '0612345679'
const adresse1 = '110 Rue Hoche 93420 Villepinte'
const prenom1 = 'Test prenom'

const bookedAt = getFrenchLuxon().toJSDate()

describe('Candidat', () => {
  let candidat
  let candidat2
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Saving Candidat', () => {
    afterEach(async () => {
      await Promise.all([
        deleteCandidat(candidat).catch(() => true),
        deleteCandidat(candidat2).catch(() => true),
      ])
    })

    it('should save a candidat with a valid nom, portable, adresse, email and a valid neph', async () => {
      // Given
      const email = validEmail

      // When
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // Then
      expect(candidat.isNew).toBe(false)
    })

    it('test Cool', async () => {
      const candidat = [
        {
          codeNeph: '123456789003',
          nomNaissance: 'Monkey D',
          prenom: 'Luffy',
          email: 'luffy.monkey.d@onepiece.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 0, days: 1 })
            .startOf('day'),
        },
        {
          codeNeph: '12345678989003',
          nomNaissance: 'Monkey D',
          prenom: 'Luffy',
          email: 'luffy.monkey.d22@onepiece.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 0, days: 2 })
            .startOf('day'),
        },
        {
          codeNeph: '12341278989003',
          nomNaissance: 'Monkey D',
          prenom: 'Luffy',
          email: 'luffy.monkey.d222@onepiece.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 0, days: 3 })
            .startOf('day'),
        },
        {
          codeNeph: '123456789002',
          nomNaissance: 'Roronoa',
          prenom: 'Zoro',
          email: 'zoro.roronoa@onepiece.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 1, days: 1 })
            .startOf('day'),
        },
        {
          codeNeph: '123456789099',
          nomNaissance: 'Trafalgar D water',
          prenom: 'Law',
          email: 'test03.test@test.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 2, days: 1 })
            .startOf('day'),
        },
        {
          codeNeph: '123456789449',
          nomNaissance: 'Trafalgar D water  03',
          prenom: 'Law',
          email: 'test033.test@test.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 3, days: 1 })
            .startOf('day'),
        },
        {
          codeNeph: '123453389099',
          nomNaissance: 'Trafalgar D water  04',
          prenom: 'Law',
          email: 'test034.test@test.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 4, days: 1 })
            .startOf('day'),
        },
        {
          codeNeph: '1234567389099',
          nomNaissance: 'Trafalgar D water 05',
          prenom: 'Law',
          email: 'test0398.test@test.com',
          portable: '0612345678',
          departement: '93',
          dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
          isValidatedByAurige: true,
          isValidatedEmail: true,
          canAccessAt: getFrenchLuxon()
            .plus({ weeks: 5, days: 0 })
            .startOf('day'),
        },
      ]

      const resultCandidats = await Promise.all(
        candidat.map(el => createCandidatAndUpdate(el, el.canAccessAt))
      )
      console.log({ resultCandidats })
      // Given
      const fctTest = weekNumber =>
        getFrenchLuxon()
          .plus({ weeks: weekNumber })
          .startOf('day')
      const weeksTmp = Array(6)
        .fill(true)
        .map(async (el, index) => ({
          weekNumber: index,
          value: await countCandidatsInscritsByDepartementAndWeek(
            '93',
            fctTest(index),
            fctTest(index + 1)
          ),
        }))

      const fullResult = await Promise.all(weeksTmp)
      console.log({ fullResult })
      // const result = await countCandidatsInscritsByDepartementAndWeek('93', start, end)
      // console.log({ result })
      // Then
    })

    it('should not save a candidat with an existing email', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const error = await createCandidat({
        autreCodeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      }).catch(error => error)

      // Then
      expect(candidat.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
    })

    it('should save a candidat with an existing NEPH', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      candidat2 = await createCandidat({
        codeNeph,
        nomNaissance: autreNomNaissance,
        prenom,
        email: anotherValidEmail,
        portable,
        adresse,
      }).catch(error => error)

      // Then
      expect(candidat.isNew).toBe(false)
      expect(candidat2.isNew).toBe(false)
    })

    it('should save a candidat with an existing nomNaissance', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      candidat2 = await createCandidat({
        codeNeph: autreCodeNeph,
        nomNaissance,
        prenom,
        email: anotherValidEmail,
        portable,
        adresse,
      }).catch(error => error)

      // Then
      expect(candidat.isNew).toBe(false)
      expect(candidat2.isNew).toBe(false)
    })

    it('should remove diacritics from nomNaissance and prenom', async () => {
      // Given
      const email = validEmail
      const nomNaissance = 'Dìàçrítïcs'
      const prenom = 'Prénôm'

      // When
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // Then
      expect(candidat.isNew).toBe(false)
      expect(candidat.nomNaissance).toBe('DIACRITICS')
      expect(candidat.prenom).toBe('Prenom')
    })

    it('should not save a candidat with an existing NEPH/nom', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const error = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email: anotherValidEmail,
        portable,
        adresse,
      }).catch(error => error)

      // Then
      expect(candidat.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain('duplicate key')
      expect(error.message).toContain(codeNeph)
      expect(error.message).toContain(nomNaissance.toUpperCase())
    })

    it('should not save a candidat with an invalid email', async () => {
      // Given
      const email = invalidEmail

      // When
      const error = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      }).catch(error => error)

      // Then
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('Updating Candidat', () => {
    afterAll(async () => {
      await deleteCandidat(candidat).catch(() => true)
    })

    it('should update a candidat′s email', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance: autreNomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const sameCandidatDifferentEmail = await updateCandidatEmail(
        candidat,
        anotherValidEmail
      )

      // Then
      expect(sameCandidatDifferentEmail).toBeDefined()
      expect(sameCandidatDifferentEmail._id.toString()).toBe(
        candidat._id.toString()
      )
      expect(sameCandidatDifferentEmail.email).not.toBe(candidat.email)
    })

    it('should update a candidat', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      const candidat1 = await updateCandidatSignUp(candidat, {
        prenom: prenom1,
        email: validEmail1,
        adresse: adresse1,
        portable: portable1,
      })

      expect(candidat1).not.toBe(null)
      expect(candidat1).toHaveProperty('prenom', prenom1)
      expect(candidat1).toHaveProperty('portable', portable1)
      expect(candidat1).toHaveProperty('adresse', adresse1)
      expect(candidat1).toHaveProperty('email', validEmail1)
    })
  })

  describe('Deleting Candidat', () => {
    it('should delete a candidat', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const deletedCandidat = await deleteCandidat(candidat)
      const noCandidat = await findCandidatByNomNeph(
        deletedCandidat.nomNaissance,
        deletedCandidat.codeNeph
      )

      // Then
      expect(noCandidat).toBe(null)
    })

    it('should delete a candidat by its email', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const deletedCandidat = await deleteCandidatByNomNeph(
        nomNaissance,
        codeNeph
      )
      const noCandidat = await findCandidatByNomNeph(
        deletedCandidat.nomNaissance,
        deletedCandidat.codeNeph
      )

      // Then
      expect(noCandidat).toBe(null)
    })

    it('should update a candidat', async () => {
      // Given
      const email = validEmail
      candidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      const candidat1 = await updateCandidatSignUp(candidat, {
        prenom: prenom1,
        email: validEmail1,
        adresse: adresse1,
        portable: portable1,
      })

      expect(candidat1).not.toBe(null)
      expect(candidat1).toHaveProperty('prenom', prenom1)
      expect(candidat1).toHaveProperty('portable', portable1)
      expect(candidat1).toHaveProperty('adresse', adresse1)
      expect(candidat1).toHaveProperty('email', validEmail1)
    })

    it('should update a candidat failed', async () => {
      const dateDernierEchecPratique = getFrenchLuxon()
      const canBookFrom = dateDernierEchecPratique.plus({ days: 45 })
      if (!candidat) {
        candidat = await createCandidat({
          codeNeph,
          nomNaissance,
          prenom,
          email: validEmail,
          portable,
          adresse,
        })
      }
      const candidat1 = await updateCandidatFailed(candidat, {
        dateDernierEchecPratique,
        canBookFrom,
      })

      expect(candidat1).not.toBe(null)
      expect(candidat1).toHaveProperty(
        'dateDernierEchecPratique',
        dateDernierEchecPratique.toJSDate()
      )
      expect(candidat1).toHaveProperty('objetDernierNonReussite', ECHEC)
      expect(candidat1).toHaveProperty('canBookFrom', canBookFrom.toJSDate())
    })

    it('should update a candidat no reussite', async () => {
      const date = getFrenchLuxon()
      const canBookFrom = date.plus({ days: 45 })
      if (!candidat) {
        candidat = await createCandidat({
          codeNeph,
          nomNaissance,
          prenom,
          email: validEmail,
          portable,
          adresse,
        })
      }
      const lastNoReussite = {
        date,
        reason: ABSENT,
      }
      const candidat1 = await updateCandidatNoReussite(candidat, {
        lastNoReussite,
        canBookFrom,
      })

      expect(candidat1).not.toBe(null)
      expect(candidat1.lastNoReussite).toHaveProperty('date', date.toJSDate())
      expect(candidat1.lastNoReussite).toHaveProperty('reason', ABSENT)
      expect(candidat1).toHaveProperty('canBookFrom', canBookFrom.toJSDate())
    })
  })

  describe('Booked Candidat', () => {
    let creactedCentres
    beforeAll(async () => {
      // await connect()
      await createCandidats()
      creactedCentres = await createCentres()
      await createPlaces()
      await makeResas(bookedAt)
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
      // await disconnect()
    })

    it('Get the booked candidats ', async () => {
      const bookedCandidats = await findBookedCandidats()
      expect(bookedCandidats.length).toBe(2)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre).toBeDefined()
      })
    })

    it('Get the booked candidats by date ', async () => {
      let dateTime = commonBasePlaceDateTime.set({ day: 19 })
      if (dateTime < getFrenchLuxon()) {
        dateTime = dateTime.plus({ month: 1 })
      }

      const bookedCandidats = await findBookedCandidats(dateTime.toJSDate())
      expect(bookedCandidats.length).toBe(1)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre).toBeDefined()
      })
    })

    it('Get the booked candidats by centre', async () => {
      const centre = creactedCentres[1]
      const bookedCandidats = await findBookedCandidats(
        undefined,
        undefined,
        centre._id
      )
      expect(bookedCandidats.length).toBe(1)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre._id).toEqual(centre._id)
      })
    })

    it('Get the booked candidats inspecteur', async () => {
      const inspecteur = (await createPlaces())[0].inspecteur
      const bookedCandidats = await findBookedCandidats(undefined, inspecteur)

      expect(bookedCandidats.length).toBe(1)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.inspecteur).toEqual(inspecteur)
      })
    })
  })

  describe('Archive place', () => {
    let createdCandidats
    let createdPlaces

    beforeAll(async () => {
      createdCandidats = await createCandidats()
      await createCentres()
      createdPlaces = await createPlaces()
    })

    afterAll(async () => {
      await deleteCandidats()
    })

    it('should add a place in archive place from candidat', async () => {
      const place = createdPlaces[0]
      const place1 = createdPlaces[1]
      const selectCandidat = createdCandidats[0]
      const candidat = await archivePlace(selectCandidat, place, REASON_CANCEL)
      const candidat1 = await archivePlace(candidat, place1, REASON_EXAM_FAILED)

      expect(candidat1).toBeDefined()
      expect(candidat1.places).toBeDefined()
      expect(candidat1.places).toHaveLength(2)
      expect(candidat1.places[0]).toHaveProperty('_id', place._id)
      expect(candidat1.places[0]).toHaveProperty('date', place.date)
      expect(candidat1.places[0]).toHaveProperty('centre', place.centre)
      expect(candidat1.places[0]).toHaveProperty('inspecteur', place.inspecteur)
      expect(candidat1.places[0].archivedAt).toBeDefined()
      expect(candidat1.places[0].archiveReason).toBeDefined()
      expect(candidat1.places[0]).toHaveProperty('archiveReason', REASON_CANCEL)

      expect(candidat1.places[1]).toHaveProperty('_id', place1._id)
      expect(candidat1.places[1]).toHaveProperty('date', place1.date)
      expect(candidat1.places[1]).toHaveProperty('centre', place1.centre)
      expect(candidat1.places[1]).toHaveProperty(
        'inspecteur',
        place1.inspecteur
      )
      expect(candidat1.places[1].archivedAt).toBeDefined()
      expect(candidat1.places[1].archiveReason).toBeDefined()
      expect(candidat1.places[1]).toHaveProperty(
        'archiveReason',
        REASON_EXAM_FAILED
      )
    })
    it('should add a place in archive place from admin', async () => {
      // Given
      const email = validEmail

      const selectCandidat = await createCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      const places = await createPlaces()
      const place = places[0]

      const candidat = await archivePlace(
        selectCandidat,
        place,
        REASON_REMOVE_RESA_ADMIN,
        'test.admin@test.com'
      )

      expect(candidat).toBeDefined()
      expect(candidat.places).toBeDefined()
      expect(candidat.places).toHaveLength(1)
      expect(candidat.places[0]).toHaveProperty('_id', place._id)
      expect(candidat.places[0]).toHaveProperty('date', place.date)
      expect(candidat.places[0]).toHaveProperty('centre', place.centre)
      expect(candidat.places[0]).toHaveProperty('inspecteur', place.inspecteur)
      expect(candidat.places[0].archivedAt).toBeDefined()
      expect(candidat.places[0].archiveReason).toBeDefined()
      expect(candidat.places[0]).toHaveProperty(
        'archiveReason',
        REASON_REMOVE_RESA_ADMIN
      )
      expect(candidat.places[0]).toHaveProperty('byUser', 'test.admin@test.com')
    })
  })
})
