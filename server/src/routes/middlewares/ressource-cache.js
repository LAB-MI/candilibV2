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
      _id: centre._id,
      geoloc: centre.geoloc,
      adresse: centre.adresse,
      geoDepartement: centre.geoDepartement,
      nom: centre.nom,
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

    if (!acc[geoDepartement]) {
      acc[geoDepartement] = {}
    }

    await Promise.all(Object.entries(centreInfos)
      .map(async ([nomCentre, centre], index) => {
        if (!acc[geoDepartement][nomCentre]) {
          acc[geoDepartement][nomCentre] = centre
        }

        const rawPlaces = (await findPlacesByDepartementAndCentre(
          nomCentre,
          geoDepartement,
          beginDateLuxon,
          endDateLuxon,
          dateDisplayPlaces,
          dateVisibleBefore,
        )) || []

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
    if (!placesAndGeoDepartementsAndCentresCache.isActive) return
    placesAndGeoDepartementsAndCentresCache.setPlaces()
      .catch((error) => {
        techLogger.error({
          section: 'get-places-as-interval-of',
          description: error.message,
          error,
        })
      })
  }, intervalInMilscd)
}

export function getGeoDepartementAndPlacesAsIntervalOf (intervalInMilscd) {
  placesAndGeoDepartementsAndCentresCache.timerIntervalGeoDepartementsAndCentresSettingId = setInterval(() => {
    if (!placesAndGeoDepartementsAndCentresCache.isActive) return
    placesAndGeoDepartementsAndCentresCache.setGeoDepartemensAndCentres()
      .catch((error) => {
        techLogger.error({
          section: 'get-geo-departement-and-places-as-interval-of',
          description: error.message,
          error,
        })
      })
  }, intervalInMilscd)
}

export const placesAndGeoDepartementsAndCentresCache = {
  // timerIntervalSetting in msec
  timerIntervalPlacesSetting: 1000,
  timerIntervalPlacesSettingId: null,
  timerIntervalGeoDepartementsAndCentresSetting: 1000,
  timerIntervalGeoDepartementsAndCentresSettingId: null,
  bufferForPlaces: {},
  bufferForGeoDepartementsAndCentres: {},
  isActive: false,

  enableCache () {
    this.isActive = true
  },
  disableCache () {
    this.isActive = false
  },

  getPlaces () {
    return this.bufferForPlaces
  },
  async setPlaces () {
    this.bufferForPlaces = await getPlacesAndCentresInfo()
  },

  getGeoDepartemensAndCentres () {
    return this.bufferForGeoDepartementsAndCentres
  },
  async setGeoDepartemensAndCentres () {
    this.bufferForGeoDepartementsAndCentres = await getGeoDepartementsAndCentresInfo()
  },

  getOnlyGeoDepartements () {
    return Object.keys(this.bufferForGeoDepartementsAndCentres)
  },

  getOnlyCentreListWithPlaceCount ({
    geoDepartement,
    beginDate,
    endDate,
    dateDisplayPlaces,
    dateVisibleBefore,
  }) {
    const centreListWithPlaceCount = Object.entries(this.bufferForPlaces[geoDepartement])
      .map(([nomCentre, centre], index) => {
        const count = centre.places.filter(place =>
          place.createdAt < dateDisplayPlaces &&
          place.visibleAt < dateVisibleBefore &&
          place.date >= beginDate && place.date < endDate,
        ).length ? 1 : 0

        const rawCentre = {
          ...centre,
        }
        delete rawCentre.places
        return {
          centre: rawCentre,
          count,
        }
      })

    return centreListWithPlaceCount
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