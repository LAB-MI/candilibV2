import { DateTime } from 'luxon'

import {
  createCandidat,
  updateCandidatEmail,
  deleteCandidat,
  deleteCandidatByNomNeph,
  findCandidatByNomNeph,
  findBookedCandidats,
  updateCandidatSignUp,
} from './'

import { connect, disconnect } from '../../mongo-connection'

import {
  commonBasePlaceDateTime,
  createCandidats,
  createCentres,
  createPlaces,
  deleteCandidats,
  makeResas,
  places,
  removeCentres,
  removePlaces,
} from '../__tests__'
import { archivePlace, updateCandidatFailed } from './candidat.queries'
import {
  REASON_CANCEL,
  REASON_EXAM_FAILED,
  REASON_REMOVE_RESA_ADMIN,
} from '../../routes/common/reason.constants'
import { createUser } from '../user'

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
      const dateDernierEchecPratique = DateTime.local()
      const canBookFrom = dateDernierEchecPratique.plus({ days: 45 })
      const candidat1 = await updateCandidatFailed(candidat, {
        dateDernierEchecPratique,
        canBookFrom,
      })

      expect(candidat1).not.toBe(null)
      expect(candidat1).toHaveProperty(
        'dateDernierEchecPratique',
        dateDernierEchecPratique.toJSDate()
      )
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
      await makeResas()
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
      if (dateTime < DateTime.local()) {
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
      const inspecteur = places[0].inspecteur
      const bookedCandidats = await findBookedCandidats(undefined, inspecteur)

      expect(bookedCandidats.length).toBe(1)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.inspecteur).toBe(inspecteur)
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
      const place = createdPlaces[0]
      const selectCandidat = createdCandidats[1]
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
