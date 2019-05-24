import {
  findAllPlaces,
  findPlaceById,
  deletePlace,
  findPlacesByCentreAndDate,
} from '../../models/place'
import {
  assignCandidatInPlace,
  createPlaceForInspector,
  importPlacesCsv,
  moveCandidatInPlaces,
  validUpdateResaInspector,
  sendMailSchedulesInspecteurs,
} from './places.business'
import { findCentresWithPlaces } from '../common/centre.business'
import { appLogger, ErrorWithStatus, dateTimeToFormatFr } from '../../util'
import { findUserById } from '../../models/user'

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
    res.status(500).send({
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
    appLogger.info(`create by admin place: La place a bien été créée.`)
    res.json({
      success: true,
      message: `La place du [${createdPlaceResult.date}] a bien été crée.`,
    })
  } catch (error) {
    appLogger.info(`create by admin place: La place n'a pas été créée.`)
    res.json({
      success: false,
      message: "La place n'a pas été créée",
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
  const { inspecteur, candidatId } = req.body
  const { id: placeId } = req.params

  const loggerContent = {
    section: 'admin-update-place',
    admin: req.userId,
  }

  try {
    if (placeId && inspecteur) {
      appLogger.info({
        ...loggerContent,
        placeId,
        inspecteur,
        action: 'UPDATE_RESA',
        message: `Changer l'inspecteur de la reservaton candidat`,
      })

      const result = await validUpdateResaInspector(placeId, inspecteur)
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

      const result = await assignCandidatInPlace(candidatId, placeId)
      const { date, hour } = dateTimeToFormatFr(result.newBookedPlace.date)
      return res.send({
        success: true,
        message: `Le candidat Nom: [${result.candidat.nomNaissance}] Neph: [${
          result.candidat.codeNeph
        }] a bien été affecté à la place du ${date} à ${hour}`,
        place: result.newBookedPlace,
      })
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
    res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }

  res.status(422).send({
    success: false,
    message: 'Les paramètres renseignés sont incorrects',
  })
}

export const sendScheduleInspecteurs = async (req, res) => {
  const { departement, date } = req.body
  const loggerContent = {
    section: 'admin-send-mail-schedule-inspecteurs',
    admin: req.userId,
    departement,
    date,
  }

  appLogger.info({
    ...loggerContent,
    action: 'SEND_MAIL_SCHEDULE',
    message: `Envoyer le planning`,
  })

  try {
    const { email } = await findUserById(req.userId)

    if (!email || !departement || !date) {
      return res.status(400).send({
        success: false,
        message: 'Les paramètres renseignés sont incorrects',
      })
    }

    const results = await sendMailSchedulesInspecteurs(email, departement, date)

    res.status(results.success ? 200 : 400).send(results)
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
    res.status(500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}
