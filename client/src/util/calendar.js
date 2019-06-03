import { getFrenchLuxonCurrentDateTime } from './frenchDateTime'

export const getDataOfTheMonth = (month = getFrenchLuxonCurrentDateTime().month, year = getFrenchLuxonCurrentDateTime().year) => {
  const selectedMonth = getFrenchLuxonCurrentDateTime().set({ year, month, day: 1 })
  const daysInMonth = selectedMonth.daysInMonth
  const daysInLastMonth = selectedMonth.minus(1, 'month').daysInMonth

  const weekdayOfFirstDay = selectedMonth.weekday
  const firstMonday = 1 + ((8 - weekdayOfFirstDay) % 7)

  const daysBefore = weekdayOfFirstDay - 1
  const daysAfter = 7 - ((daysBefore + daysInMonth) % 7)

  return {
    daysBefore,
    daysAfter,
    selectedMonth,
    daysInMonth,
    daysInLastMonth,
    weekdayOfFirstDay,
    firstMonday,
    month,
    year,
  }
}
