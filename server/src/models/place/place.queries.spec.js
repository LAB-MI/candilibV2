import moment from 'moment'
import { DateTime } from 'luxon'
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
  places,
} from '../__tests__'

import { deleteCentre, createCentre } from '../centre'
import { findPlacesByCentreAndDate, bookPlace } from './place.queries'

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
      const listPlaces = await findAvailablePlacesByCentre(centreSelected._id)
      expect(listPlaces).toBeDefined()
      expect(listPlaces).not.toBeNull()
      expect(listPlaces).toHaveLength(nbPlacesDispoByCentres({ nom }))
    })

    it('Should find 1 places for centre "Centre 2"', async () => {
      const { nom } = centres[1]
      const centreSelected = createdCentres.find(centre => centre.nom === nom)
      const listPlaces = await findAvailablePlacesByCentre(centreSelected._id)
      expect(listPlaces).toBeDefined()
      expect(listPlaces).not.toBeNull()
      expect(listPlaces).toHaveLength(nbPlacesDispoByCentres({ nom }))
    })

    it('Should 1 places availables for centre "Centre 2"', async () => {
      const { nom } = centres[1]
      const centreSelected = createdCentres.find(centre => centre.nom === nom)
      const countPlaces = await countAvailablePlacesByCentre(centreSelected._id)

      expect(countPlaces).toBeDefined()
      expect(countPlaces).not.toBeNull()
      expect(countPlaces).toBe(nbPlacesDispoByCentres({ nom }))
    })
    it('Should find 0 places for centre "Centre 2" at day 19', async () => {
      const { nom } = centres[1]
      const centreSelected = createdCentres.find(centre => centre.nom === nom)
      const begindate = DateTime.fromObject({ day: 19 }).toISO()
      const listPlaces = await findAvailablePlacesByCentre(
        centreSelected._id,
        begindate
      )
      expect(listPlaces).toBeDefined()
      expect(listPlaces).toHaveLength(1)
    })

    it('Should find 0 places for centre "Centre 2" at day 20', async () => {
      const { nom } = centres[1]
      const centreSelected = createdCentres.find(centre => centre.nom === nom)
      const begindate = DateTime.fromObject({ day: 20 }).toISO()
      const listPlaces = await findAvailablePlacesByCentre(
        centreSelected._id,
        begindate
      )
      expect(listPlaces).toBeDefined()
      expect(listPlaces).toHaveLength(0)
    })
  })
  describe('to book places', () => {
    let createdCentres
    let createdcandidats
    beforeAll(async () => {
      createdCentres = await createCentres()
      await createPlaces()
      createdcandidats = await createCandidats()
      await makeResas()
    })
    afterAll(async () => {
      await removePlaces()
      await deleteCandidats()
      await removeCentres()
    })

    it('find 1 available place of centre 2 at a day 19 11h  ', async () => {
      const selectedCentre = createdCentres.find(
        centre => centre.nom === centres[1].nom
      )
      const selectedDate = places[2].date

      const foundPlaces = await findPlacesByCentreAndDate(
        selectedCentre._id,
        selectedDate
      )

      expect(foundPlaces).toBeDefined()
      expect(foundPlaces).toHaveLength(1)
      expect(foundPlaces).not.toHaveProperty('isBooked')
    })
    it('find 0 available place of centre 2 at a day 19 10h  ', async () => {
      const selectedCentre = createdCentres.find(
        centre => centre.nom === centres[1].nom
      )
      const selectedDate = places[1].date

      const foundPlaces = await findPlacesByCentreAndDate(
        selectedCentre._id,
        selectedDate
      )

      expect(foundPlaces).toBeDefined()
      expect(foundPlaces).toHaveLength(0)
    })
    it('Should book the place of centre 3 at day 20 9h  with candidat 123456789002 ', async () => {
      const selectedPlace = places[4]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = createdCentres.find(
        centre => centre.nom === selectedPlace.centre
      )._id
      const place = await bookPlace(
        selectedCandidat,
        selectedCentre,
        selectedPlace.date
      )

      expect(place).toBeDefined()
      expect(place).toHaveProperty('isBooked', true)
      expect(place).toHaveProperty('bookedBy', selectedCandidat)
      expect(place).toHaveProperty('centre', selectedCentre)
      expect(place).toHaveProperty('inspecteur')
      expect(place.date).toEqual(
        DateTime.fromISO(selectedPlace.date).toJSDate()
      )
    })
    it('Should not book the booked place of centre 2 at day 18 9h  with candidat 123456789002 ', async () => {
      const selectedPlace = places[1]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = createdCentres.find(
        centre => centre.nom === selectedPlace.centre
      )._id
      const place = await bookPlace(
        selectedCandidat,
        selectedCentre,
        selectedPlace.date
      )
      expect(place).toBeDefined()
      expect(place).toBeNull()
    })
    it('Should book the place of centre 3 at day 21 11h  with candidat 123456789002 ', async () => {
      const selectedPlace = places[5]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = createdCentres.find(
        centre => centre.nom === selectedPlace.centre
      )._id
      const place = await bookPlace(
        selectedCandidat,
        selectedCentre,
        selectedPlace.date,
        { inspecteur: 0 }
      )

      expect(place).toBeDefined()
      expect(place).toHaveProperty('isBooked', true)
      expect(place).toHaveProperty('bookedBy', selectedCandidat)
      expect(place).toHaveProperty('centre', selectedCentre)
      expect(place.inspecteur).not.toBeDefined()
      expect(place.date).toEqual(
        DateTime.fromISO(selectedPlace.date).toJSDate()
      )
    })
  })
})
