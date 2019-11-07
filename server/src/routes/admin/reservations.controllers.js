import { findPlaceByIdAndPopulate } from '../../models/place'
import { findUserById } from '../../models/user'
import { appLogger } from '../../util'
import {
  PLACE_IS_NOT_BOOKED,
  UNKNOWN_ERROR_REMOVE_RESA,
} from './message.constants'
import { removeReservationPlaceByAdmin } from './places-business'

export const removeReservationByAdmin = async (req, res) => {
  const id = req.params.id

  const loggerContent = {
    section: 'admin-delete-resa',
    admin: req.userId,
    placeId: id,
  }
  const admin = await findUserById(req.userId)

  if (!admin) {
    const message = 'Utilisateur non trouvé'
    appLogger.warn({ ...loggerContent, description: message })
    return res.status(404).send({
      success: false,
      message,
    })
  }

  if (!id) {
    const message = 'Place non trouvée'
    appLogger.warn({ ...loggerContent, description: message })
    return res.status(404).send({
      success: false,
      message,
    })
  }

  loggerContent.action = 'DELETE_RESA_BY_ADMIN'

  appLogger.info({
    ...loggerContent,
    description: 'Supprimer la réservation candidat',
  })

  // Have a reservation
  const place = await findPlaceByIdAndPopulate(id, { candidat: true })
  if (!place) {
    loggerContent.action = 'FIND_PLACE'
    const message = 'Place non trouvée'
    appLogger.warn({ ...loggerContent, description: message })
    return res.status(404).send({
      success: false,
      message,
    })
  }

  const { candidat } = place
  if (!candidat) {
    loggerContent.action = 'NOT_RESA'
    const message = PLACE_IS_NOT_BOOKED
    appLogger.warn({
      ...loggerContent,
      description: message,
    })

    return res.status(400).send({
      success: false,
      message,
    })
  }
  try {
    // Annulation reservation
    const result = await removeReservationPlaceByAdmin(place, candidat, admin)

    appLogger.info({ ...loggerContent, result })
    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      action: loggerContent.action || 'ERROR',
      description: error.message,
      error,
    })
    return res.status(500).send({
      success: false,
      message: UNKNOWN_ERROR_REMOVE_RESA,
    })
  }
}
