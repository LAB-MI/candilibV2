import { connect, disconnect } from '../../mongo-connection'
import { createArchivedPlaceFromPlace } from './archived-place.queries'
import { createPlaces } from '../__tests__/places'
import { ECHEC } from '../candidat/objetDernierNonReussite.values'
import ArchiviedPlaceModel from '../archived-place/archived-place.model'
import { expectedArchivedPlace } from './__tests__/expect-archive-place'

describe('Archive place', () => {
  let places
  beforeAll(async () => {
    await connect()
    places = await createPlaces('Archive place')
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should create archive place with one reason', async () => {
    const place = places[0]
    await createArchivedPlaceFromPlace(place, ECHEC, 'AURIGE', true)

    const archivedPlace = await ArchiviedPlaceModel.findOne({
      placeId: place._id,
    })
    expectedArchivedPlace(archivedPlace, place, ECHEC, 'AURIGE', true)
  })
  it('should create archive place with 2 reasons', async () => {
    const place = places[1]
    await createArchivedPlaceFromPlace(
      place,
      [ECHEC, 'SALVATION'],
      'admin75@example.com',
      true
    )

    const archivedPlace = await ArchiviedPlaceModel.findOne({
      placeId: place._id,
    })
    expectedArchivedPlace(
      archivedPlace,
      place,
      [ECHEC, 'SALVATION'],
      'admin75@example.com',
      true
    )
  })
})
