import { connect, disconnect } from '../../mongo-connection'

import {
  createCentres,
  removeCentres,
  createPlaces,
  removePlaces,
  centres,
} from '../../models/__tests__/'
import { getDatesByCentre, canCancelReservation } from './places.business'
import { getFrenchLuxon } from '../../util'
import config from '../../config'

describe('Test places business: utiles functions', () => {
  it('Should true when entry date is 7 days and 2 hours days hours after now', () => {
    const dateResa = getFrenchLuxon()
      .plus({
        days: config.daysForbidCancel,
      })
      .set({ hour: 8, minute: 30 })
    const result = canCancelReservation(dateResa)
    expect(result).toBe(true)
  })

  it('Should false when entry date is 6 days and 2 hours days hours after now', () => {
    const dateResa = getFrenchLuxon()
      .plus({
        days: config.daysForbidCancel - 1,
      })
      .set({ hour: 15, minute: 30 })
    const result = canCancelReservation(dateResa)
    expect(result).toBe(false)
  })
})

describe('Test places business: get dates from places available', () => {
  beforeAll(async () => {
    await connect()
    await createCentres()
    await createPlaces()
  })

  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await disconnect()
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
