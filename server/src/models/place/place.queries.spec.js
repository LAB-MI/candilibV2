import moment from 'moment'

import {
  PLACE_ALREADY_IN_DB_ERROR,
  createPlace,
  deletePlace,
  findPlaceById,
  findAllPlaces,
  findPlaceByCandidatId,
} from '.'

import { connect, disconnect } from '../../mongo-connection'

import {
  createCandidats,
  createPlaces,
  makeResas,
  deletePlaces,
  deleteCandidats,
} from '../__tests__/candidats'

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
const centre = 'Unexisting centre'
const inspecteur = 'Bob Léponge'

describe('Place', () => {
  let place
  const leanPlace = { date, centre, inspecteur }
  let place2
  const leanPlace2 = { date2, centre, inspecteur }

  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
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
    let candidats
    let places
    beforeAll(async () => {
      await connect()
      candidats = await createCandidats()
      places = await createPlaces()
      await makeResas()
    })

    afterAll(async () => {
      await deletePlaces()
      await deleteCandidats()
      await disconnect()
    })

    it('Should find place with candidat Id ', async () => {
      const foundPlaces = await findPlaceByCandidatId(candidats[0]._id)
      expect(foundPlaces).toBeDefined()
      expect(foundPlaces.length).toBeGreaterThan(0)
      expect(foundPlaces[0]).toHaveProperty('centre', places[0].centre)
      expect(foundPlaces[0]).toHaveProperty('inspecteur', places[0].inspecteur)
      expect(foundPlaces[0]).toHaveProperty('date', places[0].date)
    })
  })
})
