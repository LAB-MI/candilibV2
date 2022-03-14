import { connect, disconnect } from '../../mongo-connection'
import { createArchivedPlaceFromPlace, findArchivedPlaceByIpcsrIdAndDates } from './archived-place-queries'
import { createPlaces } from '../__tests__/places'
import { ECHEC } from '../candidat/objetDernierNonReussite.values'
import ArchiviedPlaceModel from './archived-place-model'
import { expectedArchivedPlace } from './__tests__/expect-archive-place'
import { makeResa } from '../__tests__/reservations'
import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../util'
import { createUsers, removePlaces, deleteCandidats, deleteUsers, generateCandidats, removeAllResas } from '../__tests__'
import { UserFields } from '../user/user.model'
import { createCandidat } from '../candidat'

describe('Archive place', () => {
  let places
  let candidats
  let admins

  beforeAll(async () => {
    await connect()

    admins = await createUsers()
    places = await createPlaces()
    const now = getFrenchLuxon()
    const before60 = now.minus({ days: 59 }).toJSDate()
    const paramGenerateCandidats = {
      nbCandidats: places.length,
      isValidateAurige: true,
      isValideEmail: true,
      canBookFrom: null,
      canAccessAt: null,
      token: {
        toCreate: true,
        iatAfter: now,
        iatBefore: before60,
      },
    }

    const candidatsData = generateCandidats([paramGenerateCandidats]) // await createCandidats()
    candidats = await Promise.all(candidatsData.map(
      el => {
        return createCandidat(el)
      },
    ))
  })

  afterEach(async () => {
    await ArchiviedPlaceModel.remove({})
    await removeAllResas()
  })

  afterAll(async () => {
    await removePlaces()
    await deleteCandidats()
    await deleteUsers()
    await disconnect()
  })

  it('should create archive place with one reason', async () => {
    const place = places[0]
    await createArchivedPlaceFromPlace(place, ECHEC, 'AURIGE', true)

    const archivedPlace = await ArchiviedPlaceModel.findOne({
      placeId: place._id,
    })

    await expectedArchivedPlace(archivedPlace, place, ECHEC, 'AURIGE', true)
  })

  it('should create archive place with 2 reasons', async () => {
    const place = places[1]
    await createArchivedPlaceFromPlace(
      place,
      [ECHEC, 'SALVATION'],
      'admin75@example.com',
      true,
    )

    const archivedPlace = await ArchiviedPlaceModel.findOne({
      placeId: place._id,
    })
    await expectedArchivedPlace(
      archivedPlace,
      place,
      [ECHEC, 'SALVATION'],
      'admin75@example.com',
      true,
    )
  })
  it('should create archive place with one booking', async () => {
    const place = places[2]
    const bookedAt = getFrenchLuxon().toJSDate()
    const bookByAdmin = Object.keys(UserFields).reduce((obj, key) => ({ ...obj, [key]: admins[0][key] }), {})
    await makeResa(place, candidats[0], bookedAt, bookByAdmin)

    await createArchivedPlaceFromPlace(place, ECHEC, 'AURIGE', true)

    const archivedPlace = await ArchiviedPlaceModel.findOne({
      placeId: place._id,
    })

    await expectedArchivedPlace(archivedPlace, place, ECHEC, 'AURIGE', true)
  })

  it('should find archived places by inspecteur and range dates', async () => {
    const bookedAt = getFrenchLuxon().toJSDate()
    const bookByAdmin = Object.keys(UserFields).reduce((obj, key) => ({ ...obj, [key]: admins[0][key] }), {})

    const resas = await Promise.all(places.map((place, index) => makeResa(place, candidats[index], bookedAt, bookByAdmin)))
    await Promise.all(resas.map(place => createArchivedPlaceFromPlace(place, ECHEC, 'AURIGE', true)))
    const inspecteurSelected = resas[1].inspecteur
    const dateSelected = getFrenchLuxonFromJSDate(resas[1].date)
    const begin = dateSelected.startOf('day')
    const end = dateSelected.endOf('day')

    const archivedPlacesFound = await findArchivedPlaceByIpcsrIdAndDates(inspecteurSelected, begin.toJSDate(), end.toJSDate())

    const expecteds = places.filter(({ inspecteur, date }) => inspecteur.toString() === inspecteurSelected.toString() && date >= begin && date <= end)

    expect(archivedPlacesFound).toHaveLength(expecteds.length)

    await Promise.all(archivedPlacesFound.map(archivedPlace => {
      const place = expecteds.find(expected => archivedPlace.placeId.toString() === expected._id.toString())
      expect(place).toBeDefined()
      return expectedArchivedPlace(archivedPlace, place, ECHEC, 'AURIGE', true)
    }))
  })
})
