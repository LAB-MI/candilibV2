import config from '../../config'
import { findAllActiveCentres } from '../../models/centre'
import { findPlacesByDepartementAndCentre } from '../../models/place'

import { getFrenchLuxon, getFrenchLuxonFromJSDate, techLogger } from '../../util'
import { getAuthorizedDateToBook } from '../candidat/authorize.business'
import { getDateDisplayPlaces, getDateVisibleBefore } from '../candidat/util/date-to-display'

const getGeoDepartementsAndCentresInfo = async () => {
  const activeCentres = await findAllActiveCentres()
  const shapedListForGeoDepartementAndCentre = activeCentres.reduce((accumulator, centre) => {
    if (!accumulator[centre.geoDepartement]) {
      accumulator[centre.geoDepartement] = {}
    }
    accumulator[centre.geoDepartement][centre.nom] = {
      [centre.departement]: centre,
      places: [],
    }
    return accumulator
  }, {})

  return shapedListForGeoDepartementAndCentre
}

const getPlacesAndCentresInfo = async () => {
  const rawGeoDepartementsCentresInformations = placesAndGeoDepartementsAndCentresCache.getGeoDepartemensAndCentres()

  const beginDateLuxon = getAuthorizedDateToBook()

  const endDateLuxon = getFrenchLuxon().plus({
    month: config.numberOfVisibleMonths,
  }).endOf('month')

  const dateDisplayPlaces = getDateDisplayPlaces()

  const dateVisibleBefore = getDateVisibleBefore(0)

  const placesAndCentreInformations = await Object.entries(rawGeoDepartementsCentresInformations).reduce(async (acc, [geoDepartement, centreInfos]) => {
    acc = await acc

    await Promise.all(Object.entries(centreInfos)
      .map(async ([nomCentre, centre], index) => {
        if (!acc[geoDepartement]) {
          acc[geoDepartement] = {}
        }
        if (!acc[geoDepartement][nomCentre]) {
          acc[geoDepartement][nomCentre] = { places: [] }
        }
        const rawPlaces = await findPlacesByDepartementAndCentre(
          nomCentre,
          geoDepartement,
          beginDateLuxon,
          endDateLuxon,
          dateDisplayPlaces,
          dateVisibleBefore,
        )

        const cleanPlaces = rawPlaces.map(({ placesInfo }) => placesInfo)
          .flat(1)
          .map(place => ({
            createdAt: getFrenchLuxonFromJSDate((place.createdAt)),
            visibleAt: getFrenchLuxonFromJSDate((place.visibleAt)),
            date: getFrenchLuxonFromJSDate(place.date),
          }))

        acc[geoDepartement][nomCentre].places = cleanPlaces
      }))

    return acc
  }, {})

  return placesAndCentreInformations
}

export function getPlacesAsIntervalOf (intervalInMilscd) {
  placesAndGeoDepartementsAndCentresCache.timerIntervalPlacesSettingId = setInterval(() => {
    placesAndGeoDepartementsAndCentresCache.setPlaces()
      .then(() => {
        techLogger.info('Places setted')
      })
      .catch((error) => {
        techLogger.error(error)
      })
  }, intervalInMilscd)
}

export function getGeoDepartementAndPlacesAsIntervalOf (intervalInMilscd) {
  placesAndGeoDepartementsAndCentresCache.timerIntervalGeoDepartementsAndCentresSettingId = setInterval(() => {
    placesAndGeoDepartementsAndCentresCache.setGeoDepartemensAndCentres()
      .then(() => {
        techLogger.info('GeoDepartemens and Centres setted')
      })
      .catch((error) => {
        techLogger.error(error)
      })
  }, intervalInMilscd)
}

export const placesAndGeoDepartementsAndCentresCache = {
  // timerIntervalSetting in msec
  timerIntervalPlacesSetting: 1000,
  timerIntervalPlacesSettingId: null,
  timerIntervalGeoDepartementsAndCentresSetting: 60000 * 60 * 12,
  timerIntervalGeoDepartementsAndCentresSettingId: null,
  bufferForPlaces: {},
  bufferForGeoDepartementsAndCentres: {},

  getPlaces () {
    return this.bufferForPlaces
  },
  async setPlaces () {
    const tmpBuffer = await getPlacesAndCentresInfo()
    this.bufferForPlaces = tmpBuffer
  },

  getGeoDepartemensAndCentres () {
    return this.bufferForGeoDepartementsAndCentres
  },
  async setGeoDepartemensAndCentres () {
    const tmpBuffer = await getGeoDepartementsAndCentresInfo()
    this.bufferForGeoDepartementsAndCentres = tmpBuffer
  },

  resetPlaces () {
    this.bufferForPlaces = {}
  },
  resetGeoDepartemensAndCentres () {
    this.bufferForGeoDepartementsAndCentres = {}
  },
}

if (process.env.NODE_ENV !== 'test') {
  getPlacesAsIntervalOf(placesAndGeoDepartementsAndCentresCache.timerIntervalPlacesSetting)
}

if (process.env.NODE_ENV !== 'test') {
  getGeoDepartementAndPlacesAsIntervalOf(placesAndGeoDepartementsAndCentresCache.timerIntervalGeoDepartementsAndCentresSetting)
}
