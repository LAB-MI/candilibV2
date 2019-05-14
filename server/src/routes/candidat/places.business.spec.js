import { connect, disconnect } from '../../mongo-connection'

import {
  createCentres,
  removeCentres,
  createPlaces,
  removePlaces,
  centres,
} from '../../models/__tests__/'
import { getDatesByCentre } from './places.business'

xdescribe('Test places business', () => {
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
      const dates = await getDatesByCentre(
        centreSelected.departement,
        centreSelected.nom
      )
      expect(dates).toBeDefined()
    })
  })
})
