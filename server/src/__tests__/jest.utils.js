import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../util'

expect.extend({
  toHaveDateProperty (received, expectedProperty, expectedValue) {
    const dateReceived = received[expectedProperty]
    if (!dateReceived) {
      return {
        message: () => `expected ${expectedProperty}, value of property ${expectedProperty} is undefined`,
        pass: false,
      }
    }
    const dateReceivedLuxon = getFrenchLuxonFromJSDate(dateReceived)
    if (dateReceivedLuxon.hasSame(expectedValue, 'seconds')) {
      return {
        pass: true,
      }
    }
    return {
      message: () => `expected ${expectedProperty} error,\n Expected date: ${expectedValue.toISO()}\n Received date: ${dateReceivedLuxon.toISO()}`,
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
