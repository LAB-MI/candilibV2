import {
  createArchivedCandidat,
  updateArchivedCandidatEmail,
  deleteArchivedCandidat,
  deleteArchivedCandidatByNomNeph,
  findArchivedCandidatByNomNeph,
  updateArchivedCandidatSignUp,
} from '.'

import { connect, disconnect } from '../../mongo-connection'

import { countArchivedCandidats } from './archived-candidat-queries'
import ArchivedCandidatModel from './archived-candidat-model'

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

describe('ArchivedCandidat', () => {
  let candidat
  let candidat2
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Saving ArchivedCandidat', () => {
    afterEach(async () => {
      try {
        await ArchivedCandidatModel.collection.drop()
      } catch (error) {}
    })

    it('should save a candidat with a valid nom, portable, adresse, email and a valid neph', async () => {
      // Given
      const email = validEmail

      // When
      candidat = await createArchivedCandidat({
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
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const error = await createArchivedCandidat({
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
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      candidat2 = await createArchivedCandidat({
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
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      candidat2 = await createArchivedCandidat({
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

    it('should save a candidat with an existing NEPH/nom', async () => {
      // Given
      const email = validEmail
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const otherCandidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email: anotherValidEmail,
        portable,
        adresse,
      }).catch(error => error)

      // Then
      expect(candidat.isNew).toBe(false)
      expect(otherCandidat).not.toBeInstanceOf(Error)
    })

    it('should not save a candidat with an invalid email', async () => {
      // Given
      const email = invalidEmail

      // When
      const error = await createArchivedCandidat({
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

  describe('Updating ArchivedCandidat', () => {
    it('should update a candidat′s email', async () => {
      // Given
      const email = validEmail
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance: autreNomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const sameArchivedCandidatDifferentEmail = await updateArchivedCandidatEmail(
        candidat,
        anotherValidEmail
      )

      // Then
      expect(sameArchivedCandidatDifferentEmail).toBeDefined()
      expect(sameArchivedCandidatDifferentEmail._id.toString()).toBe(
        candidat._id.toString()
      )
      expect(sameArchivedCandidatDifferentEmail.email).not.toBe(validEmail)
    })
  })

  describe('Deleting ArchivedCandidat', () => {
    it('should delete a candidat', async () => {
      // Given
      const email = validEmail
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const countBefore = await countArchivedCandidats()
      await deleteArchivedCandidat(candidat)
      const countAfter = await countArchivedCandidats()

      // Then
      expect(countAfter).toBe(countBefore - 1)
    })

    it('should delete a candidat by its email', async () => {
      // Given
      const email = validEmail
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      // When
      const deletedArchivedCandidat = await deleteArchivedCandidatByNomNeph(
        nomNaissance,
        codeNeph
      )
      const noArchivedCandidat = await findArchivedCandidatByNomNeph(
        deletedArchivedCandidat.nomNaissance,
        deletedArchivedCandidat.codeNeph
      )

      // Then
      expect(noArchivedCandidat).toBe(null)
    })

    it('should update a candidat', async () => {
      // Given
      const email = validEmail
      candidat = await createArchivedCandidat({
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      })

      const candidat1 = await updateArchivedCandidatSignUp(candidat, {
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
})
