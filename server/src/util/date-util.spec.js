import { DateTime } from 'luxon'
import { isHolidays, isWorkingDay } from './date-util'

DateTime.prototype.isHolidays = function () {
  return isHolidays(this)
}

DateTime.prototype.isWorkingDay = function () {
  return isWorkingDay(this)
}

describe('test day off', () => {
  it('should true if date is holidays', () => {
    const isH = DateTime.local(2022, 5, 26, 12, 30, 12).isHolidays()
    expect(isH).toBe(true)
  })

  it('should false if date is not holiday', () => {
    const isH = DateTime.local(2022, 2, 26, 12, 30, 12).isHolidays()
    expect(isH).toBe(false)
  })

  it('should true if date is working day', () => {
    // samedi 26 fevrier 2022
    const isH = DateTime.local(2022, 2, 26, 12, 30, 12).isWorkingDay()
    expect(isH).toBe(true)
  })

  it('should false if date is working day', () => {
    // dimanche 27 fevrier 2022
    const isH = DateTime.local(2022, 3, 27, 12, 30, 12).isWorkingDay()
    expect(isH).toBe(false)
  })
})
