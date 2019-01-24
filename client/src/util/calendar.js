import { DateTime } from 'luxon'

export const getDataOfTheMonth = (month = DateTime.local().month, year = DateTime.local().year) => {
  const selectedMonth = DateTime.local(year, month).set({ day: 1 })
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
