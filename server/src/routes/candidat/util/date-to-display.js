import { getFrenchLuxon } from '../../../util'

const hourForPlaceVisible = 12
/**
 * Obtenir la date pour récupérer les places créés avant cette date et quand les récupérer
 * exemple: les places créés avant le jour J à 12h seront affiché à 12h
 * exemple: les places créés aprés le jour J à 12h seront affiché lendemain à 12h
 * @function
 */
export const getDateDisplayPlaces = (hour = hourForPlaceVisible) => {
  const newDate = getFrenchLuxon().minus({ hours: hourForPlaceVisible })
  return newDate.set({ hour, minute: 0, second: 0, millisecond: 0 })
}

/**
 * Obtenir la date pour récupérer les places modifiées et mettre le document places
 * exemple: les places créés avant le jour J à 12h seront affiché à 12h
 * exemple: les places créés aprés le jour J à 12h seront affiché lendemain à 12h
 * @function
 */
export const getDateVisibleForPlaces = (hour = hourForPlaceVisible) => {
  const newDate = getFrenchLuxon().plus({ hours: hourForPlaceVisible })
  return newDate.set({ hour, minute: 0, second: 0, millisecond: 0 })
}
