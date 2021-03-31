import { Settings } from 'luxon'
import { getFrenchLuxon } from '../../../util'

export const setNowBefore12h = () => {
  Settings.now = () =>
    new Date()
      .setHours(11 - 2 /* -2 because time zone in docker */, 59, 59)
      .valueOf()
}

export const setNowAtNow = () => {
  Settings.now = () => Date.now()
}

export const setNowAfter12h = (minute = 0) => {
  Settings.now = () => new Date().setHours(12, minute, 0).valueOf()
  if (getFrenchLuxon().hour > 12) {
    Settings.now = () => new Date().setHours(11, minute, 0).valueOf()
    if (getFrenchLuxon().hour > 12) {
      Settings.now = () => new Date().setHours(10, minute, 0).valueOf()
    }
  }
}

export const setNowAfterSelectedHour = (hours, minutes = 0) => {
  Settings.now = () => new Date().setHours(hours, minutes, 0).valueOf()
}
