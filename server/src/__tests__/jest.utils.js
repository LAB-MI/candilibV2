import { getFrenchLuxon, getFrenchLuxonFromISO, getFrenchLuxonFromJSDate } from '../util'

expect.extend({
  toHaveDateProperty (received, expectedProperty, expectedValue) {
    const dateReceived = received[expectedProperty]
    let dateExpected = expectedValue
    if (expectedValue instanceof Date) {
      dateExpected = getFrenchLuxonFromJSDate(expectedValue)
    } else if (expectedValue instanceof String) {
      dateExpected = getFrenchLuxonFromISO(expectedValue)
    }
    if (!dateReceived) {
      return {
        message: () => `expected ${expectedProperty}, value of property ${expectedProperty} is undefined`,
        pass: false,
      }
    }
    let dateReceivedLuxon
    if (dateReceived instanceof Date) {
      dateReceivedLuxon = getFrenchLuxonFromJSDate(dateReceived)
    } else {
      dateReceivedLuxon = getFrenchLuxonFromISO(dateReceived)
    }

    if (dateReceivedLuxon.hasSame(dateExpected, 'seconds')) {
      return {
        pass: true,
      }
    }
    return {
      message: () => `expected ${expectedProperty} error,\n Expected date: ${dateExpected.toISO()}\n Received date: ${dateReceivedLuxon.toISO()}`,
      pass: false,
    }
  },
  toHavePropertyAtNow (received, expectedProperty) {
    const dateReceived = received[expectedProperty]
    if (!dateReceived) {
      return {
        message: () => `expected ${expectedProperty}, value of property ${expectedProperty} is undefined`,
        pass: false,
      }
    }
    const dateReceivedLuxon = getFrenchLuxonFromJSDate(dateReceived)
    const now = getFrenchLuxon()
    if (now.minus({ second: 1 }) < dateReceivedLuxon && now.plus({ second: 1 }) > dateReceivedLuxon) {
      return {
        pass: true,
      }
    }
    return {
      message: () => `expected ${expectedProperty} error,\n Expected date: ${now.toISO()}\n Received date: ${dateReceivedLuxon.toISO()}`,
      pass: false,
    }
  },
  toBeNow (dateReceived) {
    const dateReceivedLuxon = getFrenchLuxonFromJSDate(dateReceived)
    const now = getFrenchLuxon()
    if (now.minus({ second: 1 }) < dateReceivedLuxon && now.plus({ second: 1 }) > dateReceivedLuxon) {
      return {
        pass: true,
      }
    }
    return {
      message: () => `expected ${dateReceived} error,\n Expected date: ${now.toISO()}\n Received date: ${dateReceivedLuxon.toISO()}`,
      pass: false,
    }
  },
})
