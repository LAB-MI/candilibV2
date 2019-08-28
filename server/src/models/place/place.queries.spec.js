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
import { connect, disconnect } from '../../mongo-connection'
import {
  getFrenchLuxon,
  getFrenchLuxonFromISO,
  getFrenchLuxonFromObject,
  getFrenchLuxonRangeFromDate,
  getFrenchLuxonFromJSDate,
} from '../../util'
import { createCentre, deleteCentre, findCentreByName } from '../centre'
import {
  candidats,
  centres,
  commonBasePlaceDateTime,
  createCandidats,
  createCentres,
  createPlaces,
  deleteCandidats,
  makeResas,
  removeCentres,
  removeInspecteur,
  removePlaces,
} from '../__tests__'
import placeModel from './place.model'
import {
  bookPlaceById,
  findAndbookPlace,
  findPlaceBookedByInspecteur,
  findPlacesByCentreAndDate,
  removeBookedPlace,
} from './place.queries'
import { createInspecteur, deleteInspecteurByMatricule } from '../inspecteur'
import { INSPECTEUR_SCHEDULE_INCONSISTENCY_ERROR } from './errors.constants'

const date1 = getFrenchLuxonFromObject({ day: 28, hour: 9 })
const date2 = getFrenchLuxonFromObject({ day: 28, hour: 9, minute: 30 })

const centre = {
  nom: 'Unexisting centre',
  departement: '93',
  adresse: 'Unexisting centre 93000',
  label: 'Unexisting centre label',
  lon: 47,
  lat: 3.5,
}
const centre2 = {
  nom: 'Unexisting centre 2',
  departement: '93',
  adresse: 'Unexisting centre 2 93000',
  label: 'Unexisting centre 2 label',
  lon: 47,
  lat: 3.5,
}
const inspecteur = {
  nom: 'Léponge',
  prenom: 'Bob',
  matricule: '047101211',
  email: 'Bob.Léponge@x-files.com',
  departement: '93',
}

const bookedAt = getFrenchLuxon().toJSDate()

describe('Place', () => {
  let place
  const leanPlace = { date: date1.toJSDate(), centre, inspecteur }
  let place2
  const leanPlace2 = { date: date2.toJSDate(), centre, inspecteur }
  const leanPlace3 = { date: date2.toJSDate(), centre2, inspecteur }
  let createdCentre
  let createdCentre2
  let createdInspecteur
  beforeAll(async () => {
    await connect()
    createdCentre = await createCentre(
      centre.nom,
      centre.label,
      centre.adresse,
      centre.lon,
      centre.lat,
      centre.departement
    )
    createdCentre2 = await createCentre(
      centre2.nom,
      centre2.label,
      centre2.adresse,
      centre2.lon,
      centre2.lat,
      centre2.departement
    )

    createdInspecteur = await createInspecteur(inspecteur)
    leanPlace.inspecteur = createdInspecteur._id
    leanPlace.centre = createdCentre._id
    leanPlace2.inspecteur = createdInspecteur._id
    leanPlace2.centre = createdCentre._id
    leanPlace3.inspecteur = createdInspecteur._id
    leanPlace3.centre = createdCentre2._id
  })

  afterAll(async () => {
    await deleteCentre(createdCentre)
    await deleteInspecteurByMatricule(createdInspecteur.matricule)
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

    it('should not save a place with same inspecteur, same date, different centre', async () => {
      // Given
      place = await createPlace(leanPlace)

      // When
      const error = await createPlace(leanPlace3).catch(error => error)

      // Then
      expect(place.isNew).toBe(false)
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe(INSPECTEUR_SCHEDULE_INCONSISTENCY_ERROR)
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

  describe('Findind Places booked', () => {
    let createdPlaces
    let createdPlacesBooked
    beforeAll(async () => {
      await createCandidats()
      //      await createCentres()
      createdPlaces = await createPlaces()
      createdPlacesBooked = await makeResas(bookedAt)
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
      await deleteCandidats()
    })

    it('Should find place with candidat Id ', async () => {
      const {
        candidat: selectedCandidat,
        centre,
        inspecteur,
        date,
      } = createdPlacesBooked[0]

      const foundPlace = await findPlaceByCandidatId(selectedCandidat._id)
      expect(foundPlace).toBeDefined()
      expect(foundPlace).toHaveProperty('centre', centre)
      expect(foundPlace).toHaveProperty('inspecteur', inspecteur)
      expect(foundPlace).toHaveProperty('date', date)
    })

    it('Should find 1 places for centre "Centre 2"', async () => {
      const { nom } = centres[1]
      const centreSelected = await findCentreByName(nom)
      const listPlaces = await findAvailablePlacesByCentre(centreSelected._id)
      expect(listPlaces).toBeDefined()
      expect(listPlaces).not.toBeNull()

      const nbPlaces = nbPlacesAvailables(
        createdPlacesBooked,
        createdPlaces,
        centreSelected
      )

      expect(listPlaces).toHaveLength(nbPlaces)
    })

    it('Should find 1 places for centre "Centre 2"', async () => {
      const { nom } = centres[1]
      const centreSelected = await findCentreByName(nom)
      const listPlaces = await findAvailablePlacesByCentre(centreSelected._id)
      expect(listPlaces).toBeDefined()
      expect(listPlaces).not.toBeNull()
      const nbPlaces = nbPlacesAvailables(
        createdPlacesBooked,
        createdPlaces,
        centreSelected
      )
      expect(listPlaces).toHaveLength(nbPlaces)
    })

    it('Should 1 places availables for centre "Centre 2"', async () => {
      const { nom } = centres[1]
      const centreSelected = await findCentreByName(nom)
      const countPlaces = await countAvailablePlacesByCentre(centreSelected._id)

      expect(countPlaces).toBeDefined()
      expect(countPlaces).not.toBeNull()
      const nbPlaces = nbPlacesAvailables(
        createdPlacesBooked,
        createdPlaces,
        centreSelected
      )

      expect(countPlaces).toBe(nbPlaces)
    })
    it('Should find 0 places for centre "Centre 2" at day 19', async () => {
      const { nom } = centres[1]
      const centreSelected = await findCentreByName(nom)
      const begindate = getFrenchLuxonFromObject({ day: 19 }).toISO()
      const listPlaces = await findAvailablePlacesByCentre(
        centreSelected._id,
        begindate
      )
      expect(listPlaces).toBeDefined()
      const nbPlaces = nbPlacesAvailables(
        createdPlacesBooked,
        createdPlaces,
        centreSelected,
        begindate
      )

      expect(listPlaces).toHaveLength(nbPlaces)
    })

    it('Should find 0 places for centre "Centre 2" at day 20', async () => {
      const { nom } = centres[1]
      const centreSelected = await findCentreByName(nom)
      let dateTime = commonBasePlaceDateTime.set({ day: 20 })
      if (dateTime < getFrenchLuxon()) {
        dateTime = dateTime.plus({ month: 1 })
      }

      const begindate = dateTime.toISO()
      const listPlaces = await findAvailablePlacesByCentre(
        centreSelected._id,
        begindate
      )
      expect(listPlaces).toBeDefined()
      const nbPlaces = nbPlacesAvailables(
        createdPlacesBooked,
        createdPlaces,
        centreSelected,
        begindate
      )

      expect(listPlaces).toHaveLength(nbPlaces)
    })

    it('Should 1 place booked with a inpecteur for one day ', async () => {
      const inspecteur = createdPlacesBooked[0].inspecteur
      const date = createdPlacesBooked[0].date
      const { begin, end } = getFrenchLuxonRangeFromDate(date)

      const placeBooked = await findPlaceBookedByInspecteur(
        inspecteur,
        begin,
        end
      )
      expect(placeBooked).toBeDefined()
      expect(placeBooked).toHaveLength(1)
    })
  })

  xdescribe('to book places', () => {
    let createdcandidats
    beforeAll(async () => {
      await createPlaces()
      createdcandidats = await createCandidats()
      await makeResas(bookedAt)
    })
    afterAll(async () => {
      await removePlaces()
      await deleteCandidats()
      await removeCentres()
      await removeInspecteur()
    })

    xit('find 1 available place of centre 2 at a day 19 11h  ', async () => {
      const places = await findAllPlaces()
      const selectedCentre = findCentreByName(centres[1].nom)
      const selectedDate = places[2].date

      const foundPlaces = await findPlacesByCentreAndDate(
        selectedCentre._id,
        selectedDate
      )

      expect(foundPlaces).toBeDefined()
      expect(foundPlaces).toHaveLength(1)
      expect(foundPlaces).not.toHaveProperty('candidat')
    })

    xit('find 0 available place of centre 2 at a day 19 10h  ', async () => {
      const places = await findAllPlaces()
      const selectedCentre = findCentreByName(centres[1].nom)
      const selectedDate = places[1].date

      const foundPlaces = await findPlacesByCentreAndDate(
        selectedCentre._id,
        selectedDate
      )

      expect(foundPlaces).toBeDefined()
      expect(foundPlaces).toHaveLength(0)
    })

    xit('Should book the place of centre 3 at day 20 9h  with candidat 123456789002 ', async () => {
      const places = await findAllPlaces()
      const selectedPlace = places[4]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = findCentreByName(selectedPlace.centre)._id

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
        getFrenchLuxonFromISO(selectedPlace.date).toJSDate()
      )
    })

    xit('Should not book the booked place of centre 2 at day 18 9h  with candidat 123456789002 ', async () => {
      const places = await findAllPlaces()
      const selectedPlace = places[1]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = findCentreByName(selectedPlace.centre)._id
      const place = await findAndbookPlace(
        selectedCandidat,
        selectedCentre,
        selectedPlace.date
      )
      expect(place).toBeDefined()
      expect(place).toBeNull()
    })

    xit('Should book the place of centre 3 at day 21 11h  with candidat 123456789002 ', async () => {
      const places = await findAllPlaces()
      const selectedPlace = places[5]
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const selectedCentre = findCentreByName(selectedPlace.centre)._id
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
        getFrenchLuxonFromISO(selectedPlace.date).toJSDate()
      )
    })

    xit('Should book the place which has not booking with candidat 123456789002 ', async () => {
      const selectedPlace = await placeModel.findOne({
        candidat: { $exists: false },
      })
      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id

      const place = await bookPlaceById(selectedPlace._id, selectedCandidat)

      expect(place).toBeDefined()
      expect(place).toHaveProperty('candidat', selectedCandidat)
      expect(place).toHaveProperty('centre', selectedPlace.centre)
      expect(place).toHaveProperty('inspecteur', selectedPlace.inspecteur)
      expect(place.date).toEqual(selectedPlace.date)
    })

    xit('Should not book the place booked with candidat 123456789002 ', async () => {
      const selectedPlace = await placeModel.findOne({
        candidat: { $exists: true },
      })

      const selectedCandidat = createdcandidats.find(
        candidat => candidat.codeNeph === candidats[2].codeNeph
      )._id
      const place = await bookPlaceById(selectedPlace._id, selectedCandidat)
      expect(place).toBeNull()
    })
  })

  xdescribe('Remove the booking places', () => {
    let createdResas
    beforeAll(async () => {
      await createCentres()
      await createPlaces()
      await createCandidats()
      createdResas = await makeResas(bookedAt)
    })
    afterAll(async () => {
      await removePlaces()
      await deleteCandidats()
      await removeCentres()
    })
    xit('should return the place without candidat', async () => {
      const selectedResa = createdResas[0]

      const place = await removeBookedPlace(selectedResa)

      expect(place).toBeDefined()
      expect(place.candidat).toBeUndefined()
    })
  })
})
function nbPlacesAvailables (
  createdPlacesBooked,
  createdPlaces,
  centreSelected,
  begindate
) {
  const idPlacesBooked = createdPlacesBooked.map(placeBooked =>
    placeBooked._id.toString()
  )
  const arrayExpectPlaces = createdPlaces.filter(({ _id, centre, date }) => {
    let bresult =
      centre._id.toString() === centreSelected._id.toString() &&
      !idPlacesBooked.includes(_id.toString())
    if (begindate) {
      bresult =
        bresult &&
        getFrenchLuxonFromJSDate(date) > getFrenchLuxonFromISO(begindate)
    }
    return bresult
  })
  let nbPlaces = 0
  if (arrayExpectPlaces) {
    nbPlaces = Array.isArray(arrayExpectPlaces) ? arrayExpectPlaces.length : 1
  }
  return nbPlaces
}
