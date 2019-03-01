import moment from 'moment'

import {
  PLACE_ALREADY_IN_DB_ERROR,
  createPlace,
  deletePlace,
  findPlaceById,
  findAllPlaces,
  findPlaceByCandidatId,
  countAvailablePlacesByCentre,
  findAvailablePlacesByCentre,
} from '.'

import { connect, disconnect } from '../../mongo-connection'

import {
  createCandidats,
  createPlaces,
  makeResas,
  removePlaces,
  deleteCandidats,
  createCentres,
  removeCentres,
  centres,
  candidats,
  nbPlacesDispoByCentres,
} from '../__tests__'

import { deleteCentre, createCentre } from '../centre'

const date = moment()
  .date(28)
  .hour(9)
  .minute(0)
  .second(0)
const date2 = moment()
  .date(28)
  .hour(9)
  .minute(30)
  .second(0)
const centre = {
  nom: 'Unexisting centre',
  departement: '93',
  adresse: 'Unexisting centre 93000',
  label: 'Unexisting centre label',
}
const inspecteur = 'Bob Léponge'

describe('Place', () => {
  let place
  const leanPlace = { date, centre, inspecteur }
  let place2
  const leanPlace2 = { date2, centre, inspecteur }
  let createdCentre
  beforeAll(async () => {
    await connect()
    const { nom, label, adresse, departement } = centre
    createdCentre = await createCentre(nom, label, adresse, departement)
    leanPlace.centre = createdCentre._id
    leanPlace2.centre = createdCentre._id
  })

  afterAll(async () => {
    await deleteCentre(createdCentre)
    await disconnect()
  })

  describe('Saving Place', () => {
    beforeAll(async () => {})
    afterEach(async () => {
      await Promise.all([
        deletePlace(place).catch(() => true),
        deletePlace(place2).catch(() => true),
      ])
    })

    it('should save a place with valid data', async () => {
      // When
      place = await createPlace(leanPlace)

      // Then
      expect(place.isNew).toBe(false)
    })

    it('should not save a place with same data than one existing', async () => {
      // Given
      place = await createPlace(leanPlace)

      // When
      const error = await createPlace(leanPlace).catch(error => error)

      // Then
      expect(place.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe(PLACE_ALREADY_IN_DB_ERROR)
    })
  })

  describe('Finding Places', () => {
    beforeEach(async () => {
      place = await createPlace(leanPlace)
      place2 = await createPlace(leanPlace2)
    })

    afterEach(async () => {
      await Promise.all([
        deletePlace(place).catch(() => true),
        deletePlace(place2).catch(() => true),
      ])
    })

    it('Should find at least 2 places', async () => {
      // When
      const places = await findAllPlaces()

      // Then
      expect(places.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Deleting Place', () => {
    afterEach(async () => {
      await Promise.all([deletePlace(place).catch(() => true)])
    })

    it('should delete a place', async () => {
      // Given
      place = await createPlace(leanPlace)

      // When
      const foundPlace = await findPlaceById(place._id)
      const deletedPlace = await deletePlace(place)
      const noPlace = await findPlaceById(deletedPlace._id)

      // Then
      expect(foundPlace).not.toBe(null)
      expect(noPlace).toBe(null)
    })
  })

  describe('Findind Place by Candidat', () => {
    let createdCandidats
    let createdPlaces
    beforeAll(async () => {
      createdCandidats = await createCandidats()
      await createCentres()
      createdPlaces = await createPlaces()
      await makeResas()
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
    })

    it('Should find place with candidat Id ', async () => {
      const selectedCandidat = createdCandidats.find(
        candidat => candidat.codeNeph === candidats[0].codeNeph
      )
      const foundPlaces = await findPlaceByCandidatId(selectedCandidat._id)
      expect(foundPlaces).toBeDefined()
      expect(foundPlaces.length).toBeGreaterThan(0)
      expect(foundPlaces[0]).toHaveProperty('centre', createdPlaces[0].centre)
      expect(foundPlaces[0]).toHaveProperty(
        'inspecteur',
        createdPlaces[0].inspecteur
      )
      expect(foundPlaces[0]).toHaveProperty('date', createdPlaces[0].date)
    })
  })

  describe('Find Place by centre', () => {
    let createdCentres
    beforeAll(async () => {
      createdCentres = await createCentres()
      await createPlaces()
      await createCandidats()
      await makeResas()
    })
    afterAll(async () => {
      await removePlaces()
      await deleteCandidats()
      await removeCentres()
    })

    it('Should find 1 places for centre "Centre 2"', async () => {
      const { nom } = centres[1]
      const centreSelected = createdCentres.find(centre => centre.nom === nom)
      const listPlaces = await findAvailablePlacesByCentre(centreSelected)
      expect(listPlaces).toBeDefined()
      expect(listPlaces).not.toBeNull()
      expect(listPlaces).toHaveLength(nbPlacesDispoByCentres({ nom }))
    })

    it('Should 1 places availables for centre "Centre 2"', async () => {
      const { nom } = centres[1]
      const centreSelected = createdCentres.find(centre => centre.nom === nom)
      const countPlaces = await countAvailablePlacesByCentre(centreSelected)

      expect(countPlaces).toBeDefined()
      expect(countPlaces).not.toBeNull()
      expect(countPlaces).toBe(nbPlacesDispoByCentres({ nom }))
    })
  })
})
