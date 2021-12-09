import config from '../../config'
import { findAllActiveCentres } from '../../models/centre'
import { findAllDepartements } from '../../models/departement'
import { findAllVisiblePlaces } from '../../models/place'

import { getFrenchLuxon, getFrenchLuxonFromJSDate, techLogger } from '../../util'
import { getAuthorizedDateToBook } from '../candidat/authorize.business'
import { getDateDisplayPlaces, getDateVisibleBefore } from '../candidat/util/date-to-display'

const getGeoDepartementsAndCentresInfo = async () => {
  const activeCentres = await findAllActiveCentres()
  const shapedListForGeoDepartementAndCentre = activeCentres.reduce((accumulator, centre) => {
    if (!accumulator[centre.geoDepartement]) {
      accumulator[centre.geoDepartement] = {}
    }

    if (accumulator[centre.geoDepartement][centre.nom]) {
      accumulator[centre.geoDepartement][centre.nom].idList = [
        centre._id.toString(),
        ...accumulator[centre.geoDepartement][centre.nom].idList,
      ]
      return accumulator
    }

    accumulator[centre.geoDepartement][centre.nom] = {
      idList: [centre._id.toString()],
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

  const rawPlaces = await findAllVisiblePlaces(
    beginDateLuxon.toISO(),
    endDateLuxon.toISO(),
    dateDisplayPlaces.toISO(),
    dateVisibleBefore.plus({ hours: 1 }).toISO(),
  )

  const placesAndCentreInformations = Object.entries(rawGeoDepartementsCentresInformations).reduce((acc, [geoDepartement, centreInfos]) => {
    if (!acc[geoDepartement]) {
      acc[geoDepartement] = {}
    }

    Object.entries(centreInfos)
      .map(async ([nomCentre, centre]) => {
        if (!acc[geoDepartement][nomCentre]) {
          acc[geoDepartement][nomCentre] = centre
        }

        const shapedPlaces = rawPlaces
          .filter(plce => acc[geoDepartement][nomCentre].idList.includes(plce.centre.toString()))
          .map(place => ({
            createdAt: getFrenchLuxonFromJSDate((place.createdAt)),
            visibleAt: getFrenchLuxonFromJSDate((place.visibleAt)),
            date: getFrenchLuxonFromJSDate(place.date),
          }))

        acc[geoDepartement][nomCentre].places = shapedPlaces
      })

    return acc
  }, {})

  return placesAndCentreInformations
}

export function getPlacesAsIntervalOf (intervalInMilscd) {
  const id = setInterval(() => {
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
  placesAndGeoDepartementsAndCentresCache.timerIntervalPlacesSettingId = id
  const { _idleStart } = id
  techLogger.info({
    section: 'get-places-as-interval-of',
    action: 'IS LAUNCHED',
    interval: {
      _idleStart,
      delay: intervalInMilscd,
    },
  })
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
  techLogger.info({
    section: 'get-geo-departement-and-places-as-interval-of',
    action: 'IS LAUNCHED',
    interval: {
      _idleStart: placesAndGeoDepartementsAndCentresCache.timerIntervalGeoDepartementsAndCentresSettingId._idleStart,
      delay: intervalInMilscd,
    },
  })
}

export const placesAndGeoDepartementsAndCentresCache = {
  // timerIntervalSetting in msec
  timerIntervalPlacesSetting: 1000,
  timerIntervalPlacesSettingId: null,
  timerIntervalGeoDepartementsAndCentresSetting: 1000,
  timerIntervalGeoDepartementsAndCentresSettingId: null,
  bufferForPlaces: {},
  bufferForGeoDepartementsAndCentres: {},
  bufferDepartementInfos: {},
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

  getDepartementInfos () {
    return this.bufferDepartementInfos
  },

  async setDepartementInfos () {
    const departements = await findAllDepartements()
    this.bufferDepartementInfos = departements.reduce((dptsTmp, dpt) => {
      dptsTmp[dpt._id] = { disableAt: dpt?.disableAt }
      return dptsTmp
    }, {})
  },

  getGeoDepartemensAndCentres () {
    return this.bufferForGeoDepartementsAndCentres
  },

  async setGeoDepartemensAndCentres () {
    this.bufferForGeoDepartementsAndCentres = await getGeoDepartementsAndCentresInfo()
  },

  getOnlyGeoDepartements () {
    const departementInfos = this.getDepartementInfos()
    return Object.keys(this.bufferForGeoDepartementsAndCentres).map(departement => {
      return {
        _id: departement,
        disableAt: departementInfos[departement]?.disableAt,
      }
    })
  },

  getOnlyCentreListWithPlaceCount ({
    geoDepartement,
    beginDate,
    endDate,
    dateDisplayPlaces,
    dateVisibleBefore,
  }) {
    if (!this.bufferForPlaces[geoDepartement]) return []

    const centreListWithPlaceCount = Object.entries(this.bufferForPlaces[geoDepartement])
      .map(([nomCentre, centre]) => {
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

  async initCache () {
    await this.setDepartementInfos()
    await this.setGeoDepartemensAndCentres()
    await this.setPlaces()
  },
}

if (process.env.NODE_ENV !== 'test') {
  getPlacesAsIntervalOf(placesAndGeoDepartementsAndCentresCache.timerIntervalPlacesSetting)
}

if (process.env.NODE_ENV !== 'test') {
  getGeoDepartementAndPlacesAsIntervalOf(placesAndGeoDepartementsAndCentresCache.timerIntervalGeoDepartementsAndCentresSetting)
}
