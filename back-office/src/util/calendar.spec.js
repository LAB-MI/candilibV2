import { getLastDayOfPreviousMonth, getDataOfTheMonth } from './calendar'

describe('calendar', () => {
  it('Should return 7', () => {
    const firstMondayDate = getDataOfTheMonth(0, 2019)
    expect(firstMondayDate.firstMonday).toBe(7)
    expect(firstMondayDate.daysInMonth).toBe(31)
  })

  it('Should return 4', () => {
    const firstMondayDate = getDataOfTheMonth(1, 2019)
    expect(firstMondayDate.firstMonday).toBe(4)
  })

  it('Should return 1', () => {
    const firstMondayDate = getDataOfTheMonth(3, 2019)
    expect(firstMondayDate.firstMonday).toBe(1)
  })

  it('Should return 31', () => {
    const numberOfDays = getLastDayOfPreviousMonth(0, 2019)
    expect(numberOfDays).toBe(31)
  })

  it('Should return 29', () => {
    const numberOfDays = getLastDayOfPreviousMonth(2, 2016)
    expect(numberOfDays).toBe(29)
  })
})
