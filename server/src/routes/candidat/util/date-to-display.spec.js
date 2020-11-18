import { getFrenchLuxon, FRENCH_TIME_ZONE, durationHours } from '../../../util'
import { DateTime } from 'luxon'
import { getDateVisibleBefore, getDateVisibleForPlaces } from './date-to-display'

jest.mock('../../../util/date-util')
jest.mock('../../common/candidat-status-const', () => ({
  candidatStatuses: {
    1: '12:00',
    2: '12:03',
  },
}))

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

  it('get date for visibleBefore', () => {
    getFrenchLuxon.mockReturnValue(dateFct({ hour: 12, minute: 0, second: 0 }))
    const durationMock = () => {
      const { durationHours } = jest.requireActual('../../../util/date-util')
      return durationHours
    }

    durationHours.mockImplementation(durationMock())

    const status = 2

    const dateVisibleBefore = getDateVisibleBefore(status)

    expect(dateVisibleBefore).toEqual(dateFct({ hour: 11, minute: 57, second: 0, millisecond: 0 }))
  })
})
