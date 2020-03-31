import * as regex from './regex'

describe('Regex', () => {
  describe('Email', () => {
    const emailWithoutAt = 'userexample.com'
    const emailWithoutUsername = '@example.com'
    const emailWithInvalidTld = 'user@example.c'
    const validEmail = 'user@example.com'

    it('Should invalidate email without @', () => {
      const testEmail = regex.email.test(emailWithoutAt)

      expect(testEmail).toBe(false)
    })

    it('Should invalidate email without username', () => {
      const testEmail = regex.email.test(emailWithoutUsername)

      expect(testEmail).toBe(false)
    })

    it('Should invalidate email with invalid tld', () => {
      const testEmail = regex.email.test(emailWithInvalidTld)

      expect(testEmail).toBe(false)
    })

    it('Should validate valid email', () => {
      const testEmail = regex.email.test(validEmail)

      expect(testEmail).toBe(true)
    })
  })

  describe('Neph', () => {
    const nephWith9Characters = '12 34 567'
    const nephWith20Characters = '12 34 56789 0 1234567890'
    const nephWithLetters = '12 34 56789A'
    const validNeph = '123456789012'

    it('Should invalidate NEPH with less than 10 characters', () => {
      const testNeph = regex.neph.test(nephWith9Characters)

      expect(testNeph).toBe(false)
    })

    it('Should invalidate NEPH with more than 19 characters', () => {
      const testNeph = regex.neph.test(nephWith20Characters)

      expect(testNeph).toBe(false)
    })

    it('Should invalidate NEPH with letters', () => {
      const testNeph = regex.neph.test(nephWithLetters)

      expect(testNeph).toBe(false)
    })

    it('Should validate valid NEPH', () => {
      const testNeph = regex.neph.test(validNeph)

      expect(testNeph).toBe(true)
    })
  })

  describe('Phone number', () => {
    const phoneWith9Numbers = '061234567'
    const phoneWith11Numbers = '06345678901'
    const phoneWith13Numbers = '0634567890123'
    const phoneWithSpaces = '06 12 34 56 78'
    const phoneWithLetters = '061234567B'
    const validPhone = '0612345678'
    const validPhone2 = '0712345678'

    it('Should invalidate phone number with less than 10 numbers', () => {
      const testPhone = regex.phone.test(phoneWith9Numbers)

      expect(testPhone).toBe(false)
    })

    it('Should invalidate phone number with more than 10 numbers', () => {
      const testPhone = regex.phone.test(phoneWith11Numbers)
      const testPhone2 = regex.phone.test(phoneWith13Numbers)

      expect(testPhone).toBe(false)
      expect(testPhone2).toBe(false)
    })

    it('Should invalidate phone number with spaces', () => {
      const testPhone = regex.phone.test(phoneWithSpaces)

      expect(testPhone).toBe(false)
    })

    it('Should invalidate phone number with letters', () => {
      const testPhone = regex.phone.test(phoneWithLetters)

      expect(testPhone).toBe(false)
    })

    it('Should validate valid phone number', () => {
      const testPhone = regex.phone.test(validPhone)
      const testPhone2 = regex.phone.test(validPhone2)

      expect(testPhone).toBe(true)
      expect(testPhone2).toBe(true)
    })
  })
})
