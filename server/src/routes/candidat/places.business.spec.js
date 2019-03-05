import { connect, disconnect } from '../../mongo-connection'

import {
  createCentres,
  removeCentres,
  createPlaces,
  removePlaces,
  centres,
  nbPlacesByCentres,
} from '../../models/__tests__/'
import { getDatesFromPlacesByCentre } from './places.business'

describe('Test places business', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Test get dates from places available', () => {
    beforeAll(async () => {
      await createCentres()
      await createPlaces()
    })

    afterAll(async () => {
      await removePlaces()
      await removeCentres()
    })

    it('Should get 2 dates from places Centre 2', async () => {
      const centreSelected = centres[1]
      const dates = await getDatesFromPlacesByCentre(
        centreSelected.departement,
        centreSelected.nom
      )
      expect(dates).toBeDefined()
      expect(dates).toHaveLength(nbPlacesByCentres(centreSelected))
    })
  })
})
