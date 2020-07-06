import { getFrenchLuxon, FRENCH_TIME_ZONE } from '../../../util'
import { DateTime } from 'luxon'
import { getDateDisplayPlaces } from './date-to-display'

jest.mock('../../../util/date-util')

const dateFct = obj =>
  DateTime.fromObject({ ...obj, zone: FRENCH_TIME_ZONE, locale: 'fr' })

describe('Date to display places', () => {
  it('get yesterday at 12h when now is 11h59', () => {
    getFrenchLuxon.mockReturnValue(
      dateFct({ hour: 11, minute: 59, second: 59 }),
    )
    const dateToDisplay = getDateDisplayPlaces()
    expect(dateToDisplay).toEqual(
      dateFct({ hour: 12, minute: 0, second: 0 }).minus({ days: 1 }),
    )
  })

  it('get yesterday at 12h when now is 12h00', () => {
    getFrenchLuxon.mockReturnValue(dateFct({ hour: 12, minute: 0, second: 0 }))
    const dateToDisplay = getDateDisplayPlaces()
    expect(dateToDisplay).toEqual(dateFct({ hour: 12, minute: 0, second: 0 }))
  })
})
