import { appLogger } from '../../util'
import { findPlaceByIdAndPopulate } from '../../models/place'
import {
  removeReservationPlaceByAdmin,
  moveCandidatInPlaces,
} from './places.business'
import { RESA_NO_BOOKED } from './message.constants'
import { findUserById } from '../../models/user'
import { ErrorWithStatus } from '../../util/error.status'

export const removeReservationByAdmin = async (req, res) => {
  const id = req.params.id

  const loggerContent = {
    section: 'admin-delete-resa',
    admin: req.userId,
    place: id,
  }
  const admin = await findUserById(req.userId)

  if (!admin) {
    return res.status(404).send({
      success: false,
      message: 'Utilisateur non trouvé',
    })
  }

  if (!id) {
    return res.status(404).send({
      success: false,
      message: 'Place non trouvée',
    })
  }

  appLogger.info({
    ...loggerContent,
    action: 'DELETE_RESA',
    message: `Suppression de la reservaton candidat`,
  })

  // Have a reservation
  const place = await findPlaceByIdAndPopulate(id, { candidat: true })
  if (!place) {
    return res.status(404).send({
      success: false,
      message: 'Place non trouvée',
    })
  }

  const { candidat } = place
  if (!candidat) {
    const message = RESA_NO_BOOKED
    appLogger.warn({
      ...loggerContent,
      action: 'NOT_RESA',
      message,
    })

    return res.status(400).send({
      success: false,
      message,
    })
  }
  try {
    // Annulation reservation
    const result = await removeReservationPlaceByAdmin(place, candidat, admin)

    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      action: 'ERROR',
      message: error.message,
    })
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}

export const updateReservationByAdmin = async (req, res) => {
  const { resa, place } = req.body

  const loggerContent = {
    section: 'admin-update-resa',
    admin: req.userId,
    resa,
    place,
  }

  appLogger.info({
    ...loggerContent,
    action: 'UPDATE_RESA',
    message: `Suppression de la reservaton candidat`,
  })

  try {
    const newResa = await moveCandidatInPlaces(resa, place)
    return res.send(newResa)
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      action: 'ERROR',
      message: error.message,
    })
    if (error instanceof ErrorWithStatus) {
      return res.status(error.status).send({
        success: false,
        message: error.message,
        error,
      })
    }
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}
