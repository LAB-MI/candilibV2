import { getProperObject, getProperObjectFromError } from './logger'
import { getFrenchLuxon } from './date-util'

describe('Logger', () => {
  describe('getProperObject(string)', () => {
    it('Should return an object with a default key and a string value', () => {
      // Given
      const message = 'Simple string'

      // When
      const properObject = getProperObject(JSON.parse(JSON.stringify(message)))

      // Then
      expect(properObject).toHaveProperty('default')
      expect(properObject.default).toBe(message)
    })
  })

  describe('getProperObjectFromError(instanceof Error)', () => {
    it('Should return an object with at least message and stack', () => {
      // Given
      const errorMessage = 'Dummy error'
      const error = new Error(errorMessage)

      // When
      const properObject = getProperObjectFromError(error)
      const jsonReadyObject = JSON.parse(JSON.stringify(properObject))

      // Then
      expect(jsonReadyObject).toHaveProperty('message')
      expect(jsonReadyObject.message).toBe(errorMessage)
    })
  })

  describe('getProperObject(instanceof Error)', () => {
    it('Should return an object with at least message and stack', () => {
      // Given
      const errorMessage = 'Dummy error'
      const error = new Error(errorMessage)

      // When
      const properObject = getProperObject(error)
      const jsonReadyObject = JSON.parse(JSON.stringify(properObject))

      // Then
      expect(jsonReadyObject).toHaveProperty('message')
      expect(jsonReadyObject.message).toBe(errorMessage)
    })
  })

  describe('getProperObject(Object with an "error" prop being an instanceof Error)', () => {
    it('Should return an object with at least "message" and "stack"', () => {
      // Given
      const errorMessage = 'Dummy error'
      const error = new Error(errorMessage)
      const objectWithError = {
        section: 'Test section',
        error,
      }

      // When
      const properObject = getProperObject(objectWithError)
      const jsonReadyObject = JSON.parse(JSON.stringify(properObject))

      // Then
      expect(jsonReadyObject).toHaveProperty('error')
      expect(jsonReadyObject.error.message).toBe(errorMessage)
    })
  })

  describe('getProperObject(Object with a date)', () => {
    it('Should return an object with at least "message" and "stack"', () => {
      // Given
      const message = {
        section: 'Test section',
        begin: getFrenchLuxon().toISO(),
      }

      // When
      const properObject = getProperObject(message)
      const jsonReadyObject = JSON.parse(JSON.stringify(properObject))

      // Then
      expect(jsonReadyObject).toHaveProperty('begin', message.begin)
      expect(jsonReadyObject).toHaveProperty('beginStr', `__${message.begin}__`)
      expect(jsonReadyObject).toHaveProperty('section', message.section)
    })

    it('Should return an object with at least "message" and "stack" with a invalid format date ', () => {
      // Given
      const message = {
        section: 'Test section',
        begin: ' 01/40/2020 25:00',
      }

      // When
      const properObject = getProperObject(message)
      const jsonReadyObject = JSON.parse(JSON.stringify(properObject))

      // Then
      expect(jsonReadyObject).not.toHaveProperty('begin')
      expect(jsonReadyObject).toHaveProperty('beginStr', `__${message.begin}__`)
      expect(jsonReadyObject).toHaveProperty('section', message.section)
    })
  })
})
