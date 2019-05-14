import { DateTime } from 'luxon'

import { connect, disconnect } from '../../mongo-connection'
import {
  candidats,
  centres,
  commonBasePlaceDateTime,
  createCandidats,
  createCentres,
  createPlaces,
  deleteCandidats,
  makeResas,
  nbPlacesDispoByCentres,
  removeCentres,
  removePlaces,
} from '../__tests__'
import {
  countAvailablePlacesByCentre,
  createPlace,
  deletePlace,
  findAllPlaces,
  findAvailablePlacesByCentre,
  findPlaceByCandidatId,
  findPlaceById,
  PLACE_ALREADY_IN_DB_ERROR,
} from '.'

import { deleteCentre, createCentre } from '../centre'
import {
  findAndbookPlace,
  findPlacesByCentreAndDate,
  removeBookedPlace,
} from './place.queries'

let date1 = DateTime.fromObject({ day: 28, hour: 9 })
let date2 = DateTime.fromObject({ day: 28, hour: 9, minute: 30 })

const centre = {
  nom: 'Unexisting centre',
  departement: '93',
  adresse: 'Unexisting centre 93000',
  label: 'Unexisting centre label',
}
const centre2 = {
  nom: 'Unexisting centre 2',
  departement: '93',
  adresse: 'Unexisting centre 2 93000',
  label: 'Unexisting centre 2 label',
}
const inspecteur = 'Bob Léponge'

xdescribe('Place', () => {
  let place
  const leanPlace = { date: date1.toJSDate(), centre, inspecteur }
  let place2
  const leanPlace2 = { date: date2.toJSDate(), centre, inspecteur }
  const leanPlace3 = { date: date2.toJSDate(), centre2, inspecteur }
  let createdCentre

  beforeAll(async () => {
    await connect()
    const { nom, label, adresse, departement } = centre
    createdCentre = await createCentre(nom, label, adresse, departement)
    // createdInspecteur await createdInspecteur({ email, nom, prenom, matricule, portable, departement })
    leanPlace.centre = createdCentre._id
    leanPlace2.centre = createdCentre._id
  })

  afterAll(async () => {
    await deleteCentre(createdCentre)
    await disconnect()
  })

  xdescribe('Saving Place', () => {
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

    it('should not save a place with same inspecteur, same date, different centre', async () => {
      // Given
      place = await createPlace(leanPlace)

      // When
      const error = await createPlace(leanPlace3).catch(error => error)

      // Then
      expect(place.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe(PLACE_ALREADY_IN_DB_ERROR)
    })
  })

  xdescribe('Finding Places', () => {
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

  xdescribe('Deleting Place', () => {
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

  xdescribe('Findind Place by Candidat', () => {
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

  xdescribe('Find Place by centre', () => {
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
      let dateTime = commonBasePlaceDateTime.set({ day: 20 })
      if (dateTime < DateTime.local()) {
        dateTime = dateTime.plus({ month: 1 })
      }

      const begindate = dateTime.toISO()
      const listPlaces = await findAvailablePlacesByCentre(
        centreSelected._id,
        begindate
      )
      expect(listPlaces).toBeDefined()
      expect(listPlaces).toHaveLength(0)
    })
  })

  xdescribe('to book places', () => {
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
      expect(foundPlaces).not.toHaveProperty('candidat')
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
      const place = await findAndbookPlace(
        selectedCandidat,
        selectedCentre,
        selectedPlace.date
      )

      expect(place).toBeDefined()
      expect(place).toHaveProperty('candidat', selectedCandidat)
      expect(place).toHaveProperty('centre', selectedCentre)
      expect(place).toHaveProperty('inspecteur')
      expect(place.date).toEqual(
        DateTime.fromISO(selectedPlace.date).toJSDate()
      )
    })
    xit('Should not book the booked place of centre 2 at day 18 9h  with candidat 123456789002 ', async () => {
      const selectedPlace = places[1]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = createdCentres.find(
        centre => centre.nom === selectedPlace.centre
      )._id
      const place = await findAndbookPlace(
        selectedCandidat,
        selectedCentre,
        selectedPlace.date
      )
      expect(place).toBeDefined()
      expect(place).toBeNull()
    })
    xit('Should book the place of centre 3 at day 21 11h  with candidat 123456789002 ', async () => {
      const selectedPlace = places[5]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = createdCentres.find(
        centre => centre.nom === selectedPlace.centre
      )._id
      const place = await findAndbookPlace(
        selectedCandidat,
        selectedCentre,
        selectedPlace.date,
        { inspecteur: 0 }
      )

      expect(place).toBeDefined()
      expect(place).toHaveProperty('candidat', selectedCandidat)
      expect(place).toHaveProperty('centre', selectedCentre)
      expect(place.inspecteur).not.toBeDefined()
      expect(place.date).toEqual(
        DateTime.fromISO(selectedPlace.date).toJSDate()
      )
    })
  })

  xdescribe('Remove the booking places', () => {
    let createdResas
    beforeAll(async () => {
      await createCentres()
      await createPlaces()
      await createCandidats()
      createdResas = await makeResas()
    })
    afterAll(async () => {
      await removePlaces()
      await deleteCandidats()
      await removeCentres()
    })
    it('should return the place without candidat', async () => {
      const selectedResa = createdResas[0]

      const place = await removeBookedPlace(selectedResa)

      expect(place).toBeDefined()
      expect(place.candidat).toBeUndefined()
    })
  })
})
