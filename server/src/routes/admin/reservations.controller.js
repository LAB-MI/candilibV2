import { appLogger } from '../../util'
import { findPlaceById } from '../../models/place'
import { removeReservationPlaceByAdmin } from './places.business'

export const deleteResa = async (req, res) => {
  const id = req.params.id

  const loggerContent = {
    section: 'admin-delete-resa',
    admin: req.userId,
    place: id,
  }

  appLogger.info({
    ...loggerContent,
    action: 'DELETE_RESA',
    message: `Suppression de la reservaton candidat`,
  })

  // Have a reservation
  const place = await findPlaceById(id)
  const { candidat } = place
  if (!candidat) {
    const message = `Il n'y a pas de reservation cette place`
    appLogger.warn({
      ...loggerContent,
      action: 'NOT_RESA',
      message: `il n'y a pas de reservation cette place`,
    })

    return res.status(204).send({
      success: false,
      message,
    })
  }
  try {
    // Annulation reservation
    removeReservationPlaceByAdmin(place, candidat, req.userId)
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
