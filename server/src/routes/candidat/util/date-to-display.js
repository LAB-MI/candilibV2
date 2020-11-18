import { getFrenchLuxon } from '../../../util'
import { getDuration } from '../../common/candidat-status'

/**
 * Obtenir la date pour récupérer les places créés avant cette date et quand les récupérer
 * exemple: les places créés avant le jour J à 12h seront affiché à 12h
 * exemple: les places créés aprés le jour J à 12h seront affiché lendemain à 12h
 * @function
 */
export const getDateDisplayPlaces = (hour = 12) => {
  const newDate = getFrenchLuxon().minus({ hours: 12 })
  return newDate.set({ hour, minute: 0, second: 0, millisecond: 0 })
}

/**
 * Obtenir la date pour récupérer les places modifiées et mettre le document places
 * exemple: les places créés avant le jour J à 12h seront affiché à 12h
 * exemple: les places créés aprés le jour J à 12h seront affiché lendemain à 12h
 * @function
 */
export const getDateVisibleForPlaces = (hour = 12) => {
  const newDate = getFrenchLuxon().plus({ hours: 12 })
  return newDate.set({ hour, minute: 0, second: 0, millisecond: 0 })
}

export const getDateVisibleBefore = (status) => {
  const now = getFrenchLuxon()
  const duration = getDuration(status)
  return now.minus({ milliseconds: duration })
}
