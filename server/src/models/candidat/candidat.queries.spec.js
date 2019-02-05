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
import moment from 'moment'
import {
  createCandidats,
  createPlaces,
  makeResas,
  deletePlaces,
  deleteCandidats,
} from './__TESTS__/candidats'

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
      expect(error.message).toContain('codeNeph_1_nomNaissance_1 dup key')
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
  })

  describe('Booked Candidat', () => {
    beforeAll(async () => {
      await connect()
      await createCandidats()
      await createPlaces()
      await makeResas()
    })

    afterAll(async () => {
      await deletePlaces()
      await deleteCandidats()
      await disconnect()
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
      const date = moment().date(28)

      const bookedCandidats = await findBookedCandidats(date)
      expect(bookedCandidats.length).toBe(1)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre).toBeDefined()
      })
    })
    it('Get the booked candidats by centre', async () => {
      const centre = 'Nom de centre à tester n°2'
      const bookedCandidats = await findBookedCandidats(
        undefined,
        undefined,
        centre
      )
      expect(bookedCandidats.length).toBe(1)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre).toBe(centre)
      })
    })
    it('Get the booked candidats inspecteur', async () => {
      const inspecteur = "Nom de l'inspecteur du centre n°1"
      const bookedCandidats = await findBookedCandidats(undefined, inspecteur)
      expect(bookedCandidats.length).toBe(1)
      bookedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.inspecteur).toBe(inspecteur)
      })
    })
  })
})
