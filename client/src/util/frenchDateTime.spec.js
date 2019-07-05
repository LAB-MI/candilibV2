import {
  FRENCH_TIME_ZONE,
  getFrenchLuxonFromIso,
  getFrenchDateFromLuxon,
  getFrenchDateTimeFromLuxon,
  getFrenchLuxonFromSql,
  getFrenchLuxonCurrentDateTime,
  getFrenchLuxonFromObject,
  getFrenchWeeksInWeekYear,
  getFrenchDateTimeFromIso,
  getFrenchDateFromIso,
  frenchOptions,
} from './frenchDateTime'

import { DateTime } from 'luxon'

describe('getFrenchLuxonFromIso', () => {
  it('Should return a luxon DateTime from ISO string', () => {
    // Given
    const theDate = DateTime.fromISO('2020-05-25T09:08:34.123+02:00', frenchOptions)
    const expectedYear = 2020
    const expectedMonth = 5
    const expectedDay = 25
    const expectedHour = 9

    // When
    const frenchDate = getFrenchLuxonFromIso(theDate)

    // Then
    expect(frenchDate.year).toBe(expectedYear)
    expect(frenchDate.month).toBe(expectedMonth)
    expect(frenchDate.day).toBe(expectedDay)
    expect(frenchDate.hour).toBe(expectedHour)
  })

  it('should return null', () => {
    // Given
    const theDate = null

    // When
    const frenchDate = getFrenchLuxonFromIso(theDate)

    // Then
    expect(frenchDate).toBeNull()
  })

  it('should return undefined', () => {
    // Given
    const theDate = undefined

    // When
    const frenchDate = getFrenchLuxonFromIso(theDate)

    // Then
    expect(frenchDate).toBeUndefined()
  })
})

describe('getFrenchDateFromLuxon', () => {
  it('Should return a human readable french date from luxon DateTime', () => {
    // Given
    const theDate = getFrenchLuxonCurrentDateTime().set({
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

  it('should return null', () => {
    // Given
    const theDate = null

    // When
    const frenchDate = getFrenchDateFromLuxon(theDate)

    // Then
    expect(frenchDate).toBeNull()
  })

  it('should return undefined', () => {
    // Given
    const theDate = undefined

    // When
    const frenchDate = getFrenchDateFromLuxon(theDate)

    // Then
    expect(frenchDate).toBeUndefined()
  })
})

describe('getFrenchDateTimeFromLuxon', () => {
  it('Should return a human readable french date and time from luxon DateTime', () => {
    // Given
    const theDate = getFrenchLuxonCurrentDateTime()
      .setZone(FRENCH_TIME_ZONE)
      .set({
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

  it('should return null', () => {
    // Given
    const theDate = null

    // When
    const frenchDate = getFrenchDateTimeFromLuxon(theDate)

    // Then
    expect(frenchDate).toBeNull()
  })

  it('should return undefined', () => {
    // Given
    const theDate = undefined

    // When
    const frenchDate = getFrenchDateTimeFromLuxon(theDate)

    // Then
    expect(frenchDate).toBeUndefined()
  })
})

describe('getFrenchDateFromIso', () => {
  it('Should return a human readable french date from ISO string', () => {
    // Given
    const theDate = '2020-05-25T09:08:34.123+02:00'
    const expectedDate = 'lundi 25 mai 2020'

    // When
    const frenchDate = getFrenchDateFromIso(theDate)

    // Then
    expect(frenchDate).toBe(expectedDate)
  })
  it('should return null', () => {
    // Given
    const theDate = null

    // When
    const frenchDate = getFrenchDateFromIso(theDate)

    // Then
    expect(frenchDate).toBeNull()
  })

  it('should return undefined', () => {
    // Given
    const theDate = undefined

    // When
    const frenchDate = getFrenchDateFromIso(theDate)

    // Then
    expect(frenchDate).toBeUndefined()
  })
})

describe('getFrenchDateTimeFromIso', () => {
  it('Should return a human readable french date and time from ISO string', () => {
    // Given
    const theDate = '2020-05-25T09:08:34.123+02:00'
    const expectedDate = 'lundi 25 mai 2020 à 09:08'

    // When
    const frenchDate = getFrenchDateTimeFromIso(theDate)

    // Then
    expect(frenchDate).toBe(expectedDate)
  })
  it('should return null', () => {
    // Given
    const theDate = null

    // When
    const frenchDate = getFrenchDateTimeFromIso(theDate)

    // Then
    expect(frenchDate).toBeNull()
  })

  it('should return undefined', () => {
    // Given
    const theDate = undefined

    // When
    const frenchDate = getFrenchDateTimeFromIso(theDate)

    // Then
    expect(frenchDate).toBeUndefined()
  })
})

describe('frenchLuxonDateTimeFromSql', () => {
  it('Should create a luxon DateTime from SQL format', () => {
    // Given
    const theDate = '2020-05-25'
    const expectedYear = 2020
    const expectedMonth = 5
    const expectedDay = 25

    // When
    const frenchDate = getFrenchLuxonFromSql(theDate)

    // Then
    expect(frenchDate.year).toBe(expectedYear)
    expect(frenchDate.month).toBe(expectedMonth)
    expect(frenchDate.day).toBe(expectedDay)
  })
  it('should return null', () => {
    // Given
    const theDate = null

    // When
    const frenchDate = getFrenchLuxonFromSql(theDate)

    // Then
    expect(frenchDate).toBeNull()
  })

  it('should return undefined', () => {
    // Given
    const theDate = undefined

    // When
    const frenchDate = getFrenchLuxonFromSql(theDate)

    // Then
    expect(frenchDate).toBeUndefined()
  })
})

describe('getFrenchLuxonCurrentDateTime', () => {
  it('Should create a luxon DateTime with current date', () => {
    // Given
    const jsDate = new Date()
    const theDate = DateTime.fromJSDate(jsDate, { zone: 'Europe/Paris', setZone: true })

    // When
    const frenchDate = getFrenchLuxonCurrentDateTime()

    // Then
    expect(frenchDate.year).toBe(theDate.year)
    expect(frenchDate.month).toBe(theDate.month)
    expect(frenchDate.day).toBe(theDate.day)
    expect(frenchDate.hour).toBe(theDate.hour)
  })
})

describe('getFrenchLuxonFromObject', () => {
  it('Should create a luxon date with fr locale from object', () => {
    // Given
    const expectedYear = 2019
    const expectedMonth = 5
    const expectedDay = 20
    const theDate = { year: expectedYear, month: expectedMonth, day: expectedDay }

    // When
    const frenchDate = getFrenchLuxonFromObject(theDate)

    // Then
    expect(frenchDate.year).toBe(expectedYear)
    expect(frenchDate.month).toBe(expectedMonth)
    expect(frenchDate.day).toBe(expectedDay)
  })
  it('should return null', () => {
    // Given
    const theDate = null

    // When
    const frenchDate = getFrenchLuxonFromObject(theDate)

    // Then
    expect(frenchDate).toBeNull()
  })

  it('should return undefined', () => {
    // Given
    const theDate = undefined

    // When
    const frenchDate = getFrenchLuxonFromObject(theDate)

    // Then
    expect(frenchDate).toBeUndefined()
  })
})

describe('getFrenchWeeksInWeekYear', () => {
  it('Should get number of weeks of the year', () => {
    // Given
    const theDate = getFrenchLuxonCurrentDateTime().set({ year: 2020 }).weeksInWeekYear
    const expectedweeks = 52

    // When
    const frenchDate = getFrenchWeeksInWeekYear(theDate)

    // Then
    expect(frenchDate).toBe(expectedweeks)
  })
})
