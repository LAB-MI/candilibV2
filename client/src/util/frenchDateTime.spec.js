import {
  getFrenchLuxonDateFromIso,
  getFrenchDateFromLuxon,
  getFrenchDateTimeFromLuxon,
  getFrenchLuxonDateTimeFromSql,
  getFrenchLuxonCurrentDateTime,
  getFrenchLuxonDateFromObject,
  getFrenchWeeksInWeekYear,
  getFrenchDateTimeFromIso,
  getFrenchDateFromIso,
} from './frenchDateTime'

import { DateTime } from 'luxon'

describe('frenchLuxonDateTimeFromIso', () => {
  it('getFrenchLuxonDateFromIso', () => {
    // Given
    const theDate = DateTime.fromISO('2020-05-25T09:08:34.123+02:00').setLocale('fr')
    const expectedYear = 2020
    const expectedMonth = 5
    const expectedDay = 25
    const expectedHour = 9

    // When
    const frenchDate = getFrenchLuxonDateFromIso(theDate)

    // Then
    expect(frenchDate.year).toBe(expectedYear)
    expect(frenchDate.month).toBe(expectedMonth)
    expect(frenchDate.day).toBe(expectedDay)
    expect(frenchDate.hour).toBe(expectedHour)
  })
})

describe('frenchDateTime', () => {
  it('getFrenchDateFromLuxon', () => {
    // Given
    const theDate = DateTime.local().setLocale('fr').set({
      year: 2020,
      month: 1,
      day: 20,
    })
    const expectedDate = 'lundi 20 janvier 2020'

    // When
    const frenchDate = getFrenchDateFromLuxon(theDate)

    // Then
    expect(frenchDate).toBe(expectedDate)
  })
})

describe('frenchDateTime', () => {
  it('getFrenchDateTimeFromLuxon', () => {
    // Given
    const theDate = DateTime.local().setLocale('fr').set({
      year: 2020,
      month: 1,
      day: 20,
      hour: 10,
      minute: 10,
    })
    const expectedDate = 'lundi 20 janvier 2020 à 10:10'

    // When
    const frenchDate = getFrenchDateTimeFromLuxon(theDate)

    // Then
    expect(frenchDate).toBe(expectedDate)
  })
})

describe('frenchDateFromIso', () => {
  it('getFrenchDateFromIso', () => {
    // Given
    const theDate = '2020-05-25T09:08:34.123+02:00'
    const expectedDate = 'lundi 25 mai 2020'

    // When
    const frenchDate = getFrenchDateFromIso(theDate)

    // Then
    expect(frenchDate).toBe(expectedDate)
  })
})

describe('frenchDateTimeFromIso', () => {
  it('getFrenchDateTimeFromIso', () => {
    // Given
    const theDate = '2020-05-25T09:08:34.123+02:00'
    const expectedDate = 'lundi 25 mai 2020 à 09:08'

    // When
    const frenchDate = getFrenchDateTimeFromIso(theDate)

    // Then
    expect(frenchDate).toBe(expectedDate)
  })
})

describe('frenchLuxonDateTimeFromSql', () => {
  it('getFrenchLuxonDateTimeFromSql', () => {
    // Given
    const theDate = '2020-05-25'
    const expectedYear = 2020
    const expectedMonth = 5
    const expectedDay = 25

    // When
    const frenchDate = getFrenchLuxonDateTimeFromSql(theDate)

    // Then
    expect(frenchDate.year).toBe(expectedYear)
    expect(frenchDate.month).toBe(expectedMonth)
    expect(frenchDate.day).toBe(expectedDay)
  })
})

describe('frenchLuxonCurrentDateTime', () => {
  it('getFrenchLuxonCurrentDateTime', () => {
    // Given
    const theDate = DateTime.local('2019 mai 25').setLocale('fr')
    const expectedYear = 2019
    const expectedMonth = 5
    const expectedDay = 20

    // When
    const frenchDate = getFrenchLuxonCurrentDateTime(theDate)

    // Then
    expect(frenchDate.year).toBe(expectedYear)
    expect(frenchDate.month).toBe(expectedMonth)
    expect(frenchDate.day).toBe(expectedDay)
  })
})

describe('frenchLuxonDateFromObject', () => {
  it('getFrenchLuxonDateFromObject', () => {
    // Given
    const expectedYear = 2019
    const expectedMonth = 5
    const expectedDay = 20
    const theDate = { year: expectedYear, month: expectedMonth, day: expectedDay }

    // When
    const frenchDate = getFrenchLuxonDateFromObject(theDate)

    // Then
    expect(frenchDate.year).toBe(expectedYear)
    expect(frenchDate.month).toBe(expectedMonth)
    expect(frenchDate.day).toBe(expectedDay)
  })
})

describe('frenchWeeksInWeekYear', () => {
  it('getFrenchWeeksInWeekYear', () => {
    // Given
    const theDate = DateTime.local(2020).setLocale('fr').weeksInWeekYear
    const expectedweeks = 52

    // When
    const frenchDate = getFrenchWeeksInWeekYear(theDate)

    // Then
    expect(frenchDate).toBe(expectedweeks)
  })
})
