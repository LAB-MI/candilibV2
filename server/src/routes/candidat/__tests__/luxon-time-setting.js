import { Settings } from 'luxon'

export const setNowBefore12h = () => {
  Settings.now = () =>
    new Date()
      .setHours(11 - 2 /* -2 because time zone in docker */, 59, 59)
      .valueOf()
}

export const setNowAtNow = () => {
  Settings.now = () => Date.now
}

export const setNowAfter12h = () => {
  Settings.now = () => new Date().setHours(12, 0, 0).valueOf()
}

export const setNowAfter1d12h = () => {
  const date = new Date()
  date.setHours(12, 0, 0)
  date.setDate(date.getDate() + 1).valueOf()
  Settings.now = () => date.valueOf()
}
