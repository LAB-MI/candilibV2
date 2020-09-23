import { getFrenchLuxon, FRENCH_TIME_ZONE } from '../../../util'
import { DateTime } from 'luxon'
import { getDateVisibleForPlaces } from './date-to-display'

jest.mock('../../../util/date-util')

const dateFct = obj =>
  DateTime.fromObject({ ...obj, zone: FRENCH_TIME_ZONE, locale: 'fr' })

describe('Date to display places', () => {
  it('get yesterday at 12h when now is 11h59', () => {
    getFrenchLuxon.mockReturnValue(
      dateFct({ hour: 11, minute: 59, second: 59 }),
    )
    const dateToDisplay = getDateVisibleForPlaces()
    expect(dateToDisplay).toEqual(dateFct({ hour: 12, minute: 0, second: 0 }))
  })

  it('get yesterday at 12h when now is 12h00', () => {
    getFrenchLuxon.mockReturnValue(dateFct({ hour: 12, minute: 0, second: 0 }))
    const dateToDisplay = getDateVisibleForPlaces()
    expect(dateToDisplay).toEqual(dateFct({ hour: 12, minute: 0, second: 0 }).plus({ days: 1 }))
  })
})
