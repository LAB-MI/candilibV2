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
  getFrenchLuxonFromJSDate,
  getFrenchLuxonFromObject,
  getFrenchLuxonRangeFromDate,
  EPREUVE_PRATIQUE_OK,
} from '../../util'
import { findArchivedPlaceByPlaceId } from '../archived-place'

import { createCentre, deleteCentre, findCentreByName } from '../centre'
import { createInspecteur, deleteInspecteurByMatricule } from '../inspecteur'
import {
  bookCandidatOnSelectedPlace,
  centres,
  commonBasePlaceDateTime,
  createCandidatAndUpdate,
  createCandidats,
  createPlaces,
  deleteCandidats,
  makeResas,
  removeCentres,
  removePlaces,
} from '../__tests__'
import { INSPECTEUR_SCHEDULE_INCONSISTENCY_ERROR } from './errors.constants'
import placeModel from './place.model'
import {
  bookPlaceById,
  findAndbookPlace,
  findPlaceBookedByInspecteur,
  findPlacesByCentreAndDate,
  removeBookedPlace,
} from './place.queries'
import { expectedArchivedPlace } from '../archived-place/__tests__/expect-archive-place'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

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

    it('should delete a place without reason', async () => {
      // Given
      place = await createPlace(leanPlace)

      // When
      const foundPlace = await findPlaceById(place._id)
      const deletedPlace = await deletePlace(place)
      const noPlace = await findPlaceById(deletedPlace._id)

      // Then
      expect(foundPlace).not.toBe(null)
      expect(noPlace).toBe(null)

      const archivedPlace = await findArchivedPlaceByPlaceId(place._id)
      expectedArchivedPlace(archivedPlace, place)
    })

    it('should delete a place with reason EPREUVE_PRATIQUE_OK', async () => {
      // Given
      place = await createPlace(leanPlace)

      // When
      const foundPlace = await findPlaceById(place._id)
      const deletedPlace = await deletePlace(
        place,
        EPREUVE_PRATIQUE_OK,
        'AURIGE',
        true
      )
      const noPlace = await findPlaceById(deletedPlace._id)

      // Then
      expect(foundPlace).not.toBe(null)
      expect(noPlace).toBe(null)
      const archivedPlace = await findArchivedPlaceByPlaceId(place._id)
      expectedArchivedPlace(
        archivedPlace,
        place,
        EPREUVE_PRATIQUE_OK,
        'AURIGE',
        true
      )
    })
  })

  describe('Finding Places booked', () => {
    let createdPlaces
    let createdPlacesBooked
    beforeAll(async () => {
      await createCandidats()
      //      await createCentres()
      createdPlaces = await createPlaces('Finding Places booked:beforAll')
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

    it('Should find 1 place for centre "Centre 2"', async () => {
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
})
describe('to book places', () => {
  const centreTest = {
    departement: '93',
    nom: 'centre 2',
    label: "Centre d'examen 2",
    adresse: '2 Avenue test, Ville test 2, FR, 93420',
    lon: 47,
    lat: 3.5,
  }

  const candidat = {
    codeNeph: '123456789003',
    nomNaissance: 'Monkey D',
    prenom: 'Luffy',
    email: 'luffy.monkey.d@onepiece.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }

  const candidat2 = {
    codeNeph: '123456789002',
    nomNaissance: 'Roronoa',
    prenom: 'Zoro',
    email: 'zoro.roronoa@onepiece.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }

  const candidat3 = {
    codeNeph: '123456789099',
    nomNaissance: 'Trafalgar D water',
    prenom: 'Law',
    email: 'test03.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }

  const inspecteurTest = {
    nom: 'Mulder-test',
    prenom: 'Fox',
    matricule: '04710111199',
    email: 'fox.muldertest1@x-files.com',
    departement: '93',
  }

  const inspecteurTest2 = {
    nom: 'Mulder-test2',
    prenom: 'Fox',
    matricule: '04710111198',
    email: 'fox.muldertest2@x-files.com',
    departement: '93',
  }

  let createdCentre
  let createdInspecteur
  let createdInspecteur2
  let createdcandidats
  let placeCreated
  let placeCreated2
  let placeCreated3
  let placeCreated4
  let placeCreated5
  let updatedCandidat
  let updatedCandidat2
  let updatedCandidat3

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
        date: commonBasePlaceDateTime.plus({ days: 1 }),
        centre: createdCentre._id,
        inspecteur: createdInspecteur._id,
      })

      placeCreated2 = await createPlace({
        date: commonBasePlaceDateTime.plus({ days: 1, hour: 2 }).toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur2._id,
      })

      placeCreated3 = await createPlace({
        date: commonBasePlaceDateTime.plus({ days: 1 }).toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur2._id,
      })

      placeCreated4 = await createPlace({
        date: commonBasePlaceDateTime.plus({ days: -1 }).toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur2._id,
      })

      placeCreated5 = await createPlace({
        date: commonBasePlaceDateTime.plus({ days: 3, hour: 2 }).toISO(),
        centre: createdCentre._id,
        inspecteur: createdInspecteur2._id,
      })

      updatedCandidat = await createCandidatAndUpdate(candidat)
      updatedCandidat2 = await createCandidatAndUpdate(candidat2)
      updatedCandidat3 = await createCandidatAndUpdate(candidat3)
      createdcandidats = [updatedCandidat, updatedCandidat2, updatedCandidat3]
    } catch (e) {
      console.warn(e)
    }
  })

  afterAll(async () => {
    try {
      await createdCentre.remove()
      await createdInspecteur.remove()
      await createdInspecteur2.remove()
      await placeCreated.remove()
      await placeCreated2.remove()
      await placeCreated3.remove()
      await placeCreated4.remove()
      await placeCreated5.remove()
      await updatedCandidat.remove()
      await updatedCandidat2.remove()
      await updatedCandidat3.remove()
    } catch (e) {
      console.warn(e)
    }
    await disconnect()
  })

  it('find 1 available place of centre 2 at a day 19 11h  ', async () => {
    const selectedCentre = createdCentre

    const selectedDate = placeCreated2.date

    const foundPlaces = await findPlacesByCentreAndDate(
      selectedCentre._id,
      selectedDate
    )

    expect(foundPlaces).toBeDefined()
    expect(foundPlaces).toHaveLength(1)
    expect(foundPlaces).not.toHaveProperty('candidat')
  })

  it('find 0 available place of centre 2 at a day 19 10h  ', async () => {
    const selectedCentre = createdCentre
    const selectedDate = commonBasePlaceDateTime.plus({ days: 1, hour: 1 })

    const foundPlaces = await findPlacesByCentreAndDate(
      selectedCentre._id,
      selectedDate
    )

    expect(foundPlaces).toBeDefined()
    expect(foundPlaces).toHaveLength(0)
  })

  it('Should book the place of centre 2 at day 20 9h  with candidat 123456789003', async () => {
    const selectedPlace = placeCreated3
    const selectedCandidat = updatedCandidat
    const selectedCentre = createdCentre

    const place = await findAndbookPlace(
      selectedCandidat._id,
      selectedCentre._id,
      selectedPlace.date,
      bookedAt
    )

    expect(place).toBeDefined()
    expect(place).toHaveProperty('candidat')
    expect(place.candidat.toString()).toEqual(selectedCandidat._id.toString())
    expect(place).toHaveProperty('centre')
    expect(place.centre.toString()).toEqual(selectedCentre._id.toString())
    expect(place).toHaveProperty('inspecteur')
    expect(place.inspecteur.toString()).toEqual(
      createdInspecteur._id.toString()
    )
    expect(place.date.toString()).toEqual(selectedPlace.date.toString())
  })

  it('Should not book the booked place of centre 2 at day 18 9h  with selectedCandidat 123456789002 ', async () => {
    const selectedPlace = placeCreated4
    const candidatToBook = updatedCandidat2
    const selectedCandidat = updatedCandidat3
    const selectedCentre = createdCentre
    const placeAlreadyBooked = await findAndbookPlace(
      candidatToBook._id,
      selectedCentre._id,
      selectedPlace.date,
      bookedAt
    )

    expect(placeAlreadyBooked).toBeDefined()
    expect(placeAlreadyBooked).toHaveProperty('candidat')
    expect(placeAlreadyBooked.candidat.toString()).toEqual(
      candidatToBook._id.toString()
    )
    expect(placeAlreadyBooked).toHaveProperty('inspecteur')
    expect(placeAlreadyBooked.inspecteur.toString()).toEqual(
      createdInspecteur2._id.toString()
    )
    expect(placeAlreadyBooked).toHaveProperty('centre')
    expect(placeAlreadyBooked.centre.toString()).toEqual(
      createdCentre._id.toString()
    )

    const placeUnbookable = await findAndbookPlace(
      selectedCandidat._id,
      selectedCentre._id,
      selectedPlace.date,
      bookedAt
    )

    expect(placeUnbookable).toBeDefined()
    expect(placeUnbookable).toBeNull()
  })

  it('Should book the place of centre 2 at day 21 11h with candidat 123456789002 ', async () => {
    const selectedPlace = placeCreated5
    const selectedCandidat = updatedCandidat3
    const selectedCentre = createdCentre
    const place = await findAndbookPlace(
      selectedCandidat._id,
      selectedCentre._id,
      selectedPlace.date,
      bookedAt
    )

    expect(place).toBeDefined()
    expect(place).toHaveProperty('candidat')
    expect(place.candidat.toString()).toEqual(selectedCandidat._id.toString())
    expect(place).toHaveProperty('centre')
    expect(place.centre.toString()).toEqual(selectedCentre._id.toString())
    expect(place.date.toString()).toEqual(selectedPlace.date.toString())
  })

  it('Should book the place which has not booking with candidat 123456789002 ', async () => {
    const selectedPlace = await placeModel.findOne({
      candidat: { $exists: false },
    })
    const selectedCandidat = createdcandidats.find(
      candidat => candidat.codeNeph === '123456789002'
    )._id

    const place = await bookPlaceById(selectedPlace._id, selectedCandidat)

    expect(place).toBeDefined()
    expect(place).toHaveProperty('candidat', selectedCandidat)
    expect(place).toHaveProperty('centre', selectedPlace.centre)
    expect(place).toHaveProperty('inspecteur', selectedPlace.inspecteur)
    expect(place.date).toEqual(selectedPlace.date)
  })

  it('Should not book the place booked with candidat 123456789002 ', async () => {
    const selectedPlace = await placeModel.findOne({
      candidat: { $exists: true },
    })

    const selectedCandidat = updatedCandidat3
    const place = await bookPlaceById(selectedPlace._id, selectedCandidat._id)
    expect(place).toBeNull()
  })
})

describe('Remove the booking places', () => {
  const centreTest = {
    departement: '93',
    nom: 'centre 2',
    label: "Centre d'examen 2",
    adresse: '2 Avenue test, Ville test 2, FR, 93420',
    lon: 47,
    lat: 3.5,
  }

  const candidat = {
    codeNeph: '123456789003',
    nomNaissance: 'nom à tester 1',
    prenom: 'prénom à tester n°4',
    email: 'test01.test@test.com',
    portable: '0612345678',
    adresse: '10 Rue Oberkampf 75011 Paris',
    dateReussiteETG: getFrenchLuxon().plus({ year: -1 }),
    isValidatedByAurige: true,
    isValidatedEmail: true,
  }
  const inspecteurTest = {
    nom: 'Mulder-test',
    prenom: 'Fox',
    matricule: '04710111199',
    email: 'fox.muldertest1@x-files.com',
    departement: '93',
  }

  let createdCentre
  let createdInspecteur
  let placeCreated
  let updatedCandidat
  let placeToDelete

  beforeAll(async () => {
    await connect()
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
    placeCreated = await createPlace({
      date: commonBasePlaceDateTime.plus({ days: 1 }),
      centre: createdCentre._id,
      inspecteur: createdInspecteur._id,
    })
    updatedCandidat = await createCandidatAndUpdate(candidat)

    placeToDelete = await bookCandidatOnSelectedPlace(
      placeCreated,
      updatedCandidat,
      bookedAt
    )
  })

  afterAll(async () => {
    await createdCentre.remove()
    await createdInspecteur.remove()
    await placeCreated.remove()
    await updatedCandidat.remove()
    await disconnect()
  })

  it('should return the place without candidat', async () => {
    const selectedResa = placeToDelete

    const place = await removeBookedPlace(selectedResa)

    expect(place).toBeDefined()
    expect(place.candidat).toBeUndefined()
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
