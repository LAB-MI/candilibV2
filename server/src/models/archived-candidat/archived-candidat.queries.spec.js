import {
  createArchivedCandidat,
  updateArchivedCandidatEmail,
  deleteArchivedCandidat,
  deleteArchivedCandidatByNomNeph,
  findArchivedCandidatByNomNeph,
  findAllArchivedCandidatsLean,
  findBookedArchivedCandidats,
  updateArchivedCandidatSignUp,
} from '.'

import { connect, disconnect } from '../../mongo-connection'
import { deletePlace, createPlace, findAllPlaces } from '../place'
import moment from 'moment'
import { countArchivedCandidats } from './archived-candidat.queries'
import ArchivedCandidatModel from './archived-candidat.model'

const candidats = [
  {
    codeNeph: '123456789000',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°1',
    email: 'test1.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
  },
  {
    codeNeph: '123456789001',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°2',
    email: 'test2.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
  },
  {
    codeNeph: '123456789002',
    nomNaissance: 'nom à tester',
    prenom: 'prénom à tester n°3',
    email: 'test3.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
  },
]
const places = [
  {
    date: (() =>
      moment()
        .date(28)
        .hour(9)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Nom de centre à tester n°1',
    inspecteur: "Nom de l'inspecteur du centre n°1",
  },
  {
    date: (() =>
      moment()
        .date(29)
        .hour(10)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Nom de centre à tester n°2',
    inspecteur: "Nom de l'inspecteur du centre n°2",
  },
  {
    date: (() =>
      moment()
        .date(28)
        .hour(11)
        .minute(0)
        .second(0)
        .toDate())(),
    centre: 'Nom de centre à tester n°3',
    inspecteur: "Nom de l'inspecteur du centre n°3",
  },
]

const createArchivedCandidats = async () => {
  return Promise.all(
    candidats.map(candidat => createArchivedCandidat(candidat))
  )
}

const createPlaces = async () => {
  return Promise.all(places.map(place => createPlace(place)))
}

const makeResa = (place, candidat) => {
  return place.update({ bookedBy: candidat._id })
}

const makeResas = async () => {
  const placesDb = (await findAllPlaces()).sort((a, b) =>
    a.centre.localeCompare(b.centre)
  )
  const candidatsDb = (await findAllArchivedCandidatsLean()).sort((a, b) =>
    a.codeNeph.localeCompare(b.codeNeph)
  )
  return Promise.all([
    makeResa(placesDb[0], candidatsDb[0]),
    makeResa(placesDb[1], candidatsDb[1]),
  ])
}

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
      expect(sameArchivedCandidatDifferentEmail.email).not.toBe(candidat.email)
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

  describe('Booked ArchivedCandidat', () => {
    beforeAll(async () => {
      await connect()
      await createArchivedCandidats()
      await createPlaces()
      await makeResas()
    })

    afterAll(async () => {
      const placesDb = await findAllPlaces()
      const candidatsDb = await findAllArchivedCandidatsLean()
      await Promise.all(placesDb.map(place => deletePlace(place)))
      await Promise.all(
        candidatsDb.map(candidat => deleteArchivedCandidat(candidat))
      )
      await disconnect()
    })

    it('Get the booked candidats ', async () => {
      const bookedArchivedCandidats = await findBookedArchivedCandidats()
      expect(bookedArchivedCandidats.length).toBe(2)
      bookedArchivedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre).toBeDefined()
      })
    })
    it('Get the booked candidats by date ', async () => {
      const date = moment().date(28)

      const bookedArchivedCandidats = await findBookedArchivedCandidats(date)
      expect(bookedArchivedCandidats.length).toBe(1)
      bookedArchivedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre).toBeDefined()
      })
    })
    it('Get the booked candidats by centre', async () => {
      const centre = 'Nom de centre à tester n°2'
      const bookedArchivedCandidats = await findBookedArchivedCandidats(
        undefined,
        undefined,
        centre
      )
      expect(bookedArchivedCandidats.length).toBe(1)
      bookedArchivedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.centre).toBe(centre)
      })
    })
    it('Get the booked candidats inspecteur', async () => {
      const inspecteur = "Nom de l'inspecteur du centre n°1"
      const bookedArchivedCandidats = await findBookedArchivedCandidats(
        undefined,
        inspecteur
      )
      expect(bookedArchivedCandidats.length).toBe(1)
      bookedArchivedCandidats.forEach(candidat => {
        expect(candidat.place).toBeDefined()
        expect(candidat.place.inspecteur).toBe(inspecteur)
      })
    })
  })
})
