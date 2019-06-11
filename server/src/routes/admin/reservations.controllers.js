import { findPlaceByIdAndPopulate } from '../../models/place'
import { findUserById } from '../../models/user'
import { appLogger } from '../../util'
import { RESA_NO_BOOKED } from './message.constants'
import { removeReservationPlaceByAdmin } from './places.business'

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
      error,
    })
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}
