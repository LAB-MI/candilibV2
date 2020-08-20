import { Settings } from 'luxon'
const dockerTimeZone = 0 /* set -2 because time zone in docker */
/**
 * Met l'heure et la date de la machine à la date donnée pour les tests.
 * Ne sert que pour les tests
 *
 * @function
 *
 * @params {number} hours - Heure
 * @params {number} min - Minutes
 * @params {number} sec - Secondes
 */
export const setHoursMinutesSeconds = (hours, min, sec) => {
  Settings.now = () =>
    new Date()
      .setHours((hours - dockerTimeZone), min, sec)
      .valueOf()
}

export const setNowAtNow = () => {
  Settings.now = () => Date.now
}
