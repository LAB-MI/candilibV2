import { DateTime } from 'luxon'

const hours = [
  '09h00-09h30',
  '09h30-10h00',
  '10h00-10h30',
  '10h30-11h00',
  '11h00-11h30',
  '11h30-12h00',
  '12h00-12h30',
  '12h30-13h00',
  '13h00-13h30',
  '13h30-14h00',
  '14h00-14h30',
  '14h30-15h00',
  '15h00-15h30',
  '15h30-16h00',
  '16h00-16h30',
  '16h30-17h00',
  '17h00-17h30',
  '17h30-18h00',
  '18h00-18h30',
  '18h30-19h00',
]

const getDaysAndHours = (month) => Array(10).fill(true)
  .map((el, index) => (
    DateTime.local().set({ month })
      .plus({ days: index })
      .setLocale('fr')
      .toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' })
  ))
  .map(day => ({ day, hours }))

const getMonthData = (month) => ({
  month: DateTime.local().set({ month }).toLocaleString(({ month: 'long' })),
  availableTimeSlots: getDaysAndHours(month),
})

const arrayMonth = Array(4).fill(true).map((el, index, arr) => getMonthData(DateTime.local().plus({ month: index }).month))

export default arrayMonth
