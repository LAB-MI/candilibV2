import {
  findAllPlaces,
  findPlaceById,
  deletePlace,
  findPlacesByCentreAndDate,
} from '../../models/place'
import {
  createPlaceForInspector,
  importPlacesCsv,
  validUpdateResaInspector,
  moveCandidatInPlaces,
  affectCandidatInPlace,
} from './places.business'
import { findCentresWithPlaces } from '../common/centre.business'

import { appLogger, ErrorWithStatus, getDateTimeFrFromJSDate, dateTimeToFormatFr } from '../../util'

export const importPlaces = async (req, res) => {
  const csvFile = req.files.file
  const { departement } = req.body

  try {
    appLogger.info(
      `import places provenant du fichier ${
        csvFile.name
      } et du departement ${departement}`
    )
    const result = await importPlacesCsv({ csvFile, departement })
    appLogger.info(
      `import places: Le fichier ${
        csvFile.name
      } a été traité pour le departement ${departement}.`
    )
    res.status(200).send({
      fileName: csvFile.name,
      success: true,
      message: `Le fichier ${
        csvFile.name
      } a été traité pour le departement ${departement}.`,
      places: result,
    })
  } catch (error) {
    appLogger.error(error)
    return res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}

export const getPlaces = async (req, res) => {
  let places
  const { departement, beginDate, endDate, centre, date } = req.query

  if (!departement) {
    places = await findAllPlaces()
    res.json(places)
  } else {
    if (centre && date) {
      places = await findPlacesByCentreAndDate(centre, date, {
        inspecteur: true,
        centre: true,
      })
    } else {
      places = await findCentresWithPlaces(departement, beginDate, endDate)
    }
    res.json(places)
  }
}

export const createPlaceByAdmin = async (req, res) => {
  const { centre, inspecteur, date } = req.body
  try {
    const createdPlaceResult = await createPlaceForInspector(
      centre,
      inspecteur,
      date
    )
    appLogger.info(`create by admin place: La place a bien été crée.`)
    res.json({
      success: true,
      message: `La place du [${createdPlaceResult.date}] a bien été crée.`,
    })
  } catch (error) {
    appLogger.info(`create by admin place: La place n'a pas été crée.`)
    res.json({
      success: false,
      message: "La place n'a pas été crée",
      error: error.nessage,
    })
  }
}

export const deletePlaceByAdmin = async (req, res) => {
  const { id } = req.params
  const place = await findPlaceById(id)
  if (!place) {
    appLogger.info(`delete place: La place id: [${id}] n'existe pas en base.`)
    res.json({ success: false, message: "La place n'existe pas en base" })
  } else {
    try {
      await deletePlace(place)
      appLogger.info(
        `delete place: La place id: [${id}] a bien été supprimé de la base.`
      )
      const { date, hour } = dateTimeToFormatFr(place.date)
      res.json({
        success: true,
        message: `La place du [${date} ${hour}] a bien été supprimé de la base`,
      })
    } catch (error) {
      appLogger.info(
        `delete place: La place id: [${id}] a bien été supprimé de la base.`
      )
      res.json({
        success: false,
        message: `La place id: [${id}] n'a pas été supprimé`,
        error: error.message,
      })
    }
  }
}

export const updatePlaces = async (req, res) => {
  const { resa, inspecteur, placeId, candidatId } = req.body

  const loggerContent = {
    section: 'admin-update-place',
    admin: req.userId,
  }

  try {
    if (resa && inspecteur) {
      const loggerContent = {
        section: 'admin-update-resa',
        admin: req.userId,
        resa,
        inspecteur,
      }

      appLogger.info({
        ...loggerContent,
        action: 'UPDATE_RESA',
        message: `Changer l'inspecteur de la reservaton candidat`,
      })

      const result = await validUpdateResaInspector(resa, inspecteur)
      const newResa = await moveCandidatInPlaces(result.resa, result.place)
      return res.json({
        success: true,
        message: `La modification est confirmée.`,
        place: newResa,
      })
    }

    if (placeId && candidatId) {
      appLogger.info({
        ...loggerContent,
        placeId,
        candidatId,
        action: 'UPDATE_PLACE',
        message: `Affecter un candidat à une place`,
      })
      const candidat = await findCandidatById(candidatId)
      const place = await findPlaceById(placeId)

      if (!candidat || !place) {
        throw new ErrorWithStatus(
          422,
          'Les paramètres renseignés sont incorrects'
        )
      }
      if ('isValidatedByAurige' in candidat && !candidat.isValidatedByAurige) {
        throw new ErrorWithStatus(
          400,
          "Le candidat n'est pas validé par Aurige"
        )
      }
      if (
        getDateTimeFrFromJSDate(candidat.dateReussiteETG).plus({ year: 5 }) <
        getDateTimeFrFromJSDate(place.date)
      ) {
        throw new ErrorWithStatus(
          400,
          'Date ETG ne sera plus valide pour cette place'
        )
      }
      const newResa = await affectCandidatInPlace(candidatId, placeId)
      return res.send(newResa)
    }
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

  res
    .status(422)
    .send({ success: false, message: 'Les paramètres renseignés sont incorrects' })
}
