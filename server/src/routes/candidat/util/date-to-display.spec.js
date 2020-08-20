import { getFrenchLuxon, FRENCH_TIME_ZONE } from '../../../util'
import { DateTime } from 'luxon'
import { getDateDisplayPlaces } from './date-to-display'

jest.mock('../../../util/date-util')

const dateFct = obj =>
  DateTime.fromObject({ ...obj, zone: FRENCH_TIME_ZONE, locale: 'fr' })

describe('Date to display places', () => {
  it('Should be true if createdAt is after 2 hours', () => {
    getFrenchLuxon.mockReturnValue(
      dateFct({ hour: 11, minute: 0, second: 1 }),
    )

    const fakeDatePlaceCreatedAt = dateFct({ hour: 9, minute: 0, second: 0 })
    const dateToDisplay = getDateDisplayPlaces()
    expect(fakeDatePlaceCreatedAt < dateToDisplay).toEqual(true)
  })
  it('Should be false if createdAt is before 2 hours', () => {
    getFrenchLuxon.mockReturnValue(
      dateFct({ hour: 11, minute: 0, second: 0 }),
    )

    const fakeDatePlaceCreatedAt = dateFct({ hour: 11, minute: 0, second: 1 })
    const dateToDisplay = getDateDisplayPlaces()
    expect(fakeDatePlaceCreatedAt < dateToDisplay).toEqual(false)
  })
})
