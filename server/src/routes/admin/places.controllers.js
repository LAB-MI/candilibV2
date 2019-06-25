import config from '../../config'
import {
  deletePlace,
  findAllPlaces,
  findPlaceById,
  findPlacesByCentreAndDate,
} from '../../models/place'
import { findUserById } from '../../models/user'
import { findDepartementbyId } from '../../models/departement'
import { appLogger, dateTimeToFormatFr, ErrorWithStatus } from '../../util'
import { findCentresWithPlaces } from '../common/centre.business'
import {
  assignCandidatInPlace,
  createPlaceForInspector,
  importPlacesFromFile,
  moveCandidatInPlaces,
  sendMailSchedulesAllInspecteurs,
  sendMailSchedulesInspecteurs,
  validUpdateResaInspector,
} from './places.business'
import { sendMailConvocation } from '../business'

export const importPlaces = async (req, res) => {
  const planningFile = req.files.file
  const { departement } = req.body

  const loggerInfo = {
    section: 'admin-import-places',
    user: req.userId,
    departement,
    filename: planningFile.name,
  }

  try {
    appLogger.info({
      ...loggerInfo,
      description: `import places provenant du fichier ${planningFile.name} et du departement ${departement}`,
    })
    const result = await importPlacesFromFile({ planningFile, departement })
    appLogger.info({
      ...loggerInfo,
      description: `import places: Le fichier ${planningFile.name} a été traité pour le departement ${departement}.`,
    })

    res.status(200).send({
      fileName: planningFile.name,
      success: true,
      message: `Le fichier ${planningFile.name} a été traité pour le departement ${departement}.`,
      places: result,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      error,
    })
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

  const loggerInfo = {
    section: 'admin-get-places',
    user: req.userId,
    departement,
    beginDate,
    endDate,
    centre,
    date,
  }

  try {
    if (!departement) {
      loggerInfo.action = 'find-all-departement'
      places = await findAllPlaces()
    } else {
      if (centre && date) {
        loggerInfo.action = 'find-by-centre-date'
        places = await findPlacesByCentreAndDate(centre, date, {
          inspecteur: true,
          centre: true,
        })
      } else {
        loggerInfo.action = 'find-by-departement-date'
        places = await findCentresWithPlaces(departement, beginDate, endDate)
      }
    }
    appLogger.info({
      ...loggerInfo,
      description: `${places ? places.length : 0} trouvées`,
    })
    res.json(places)
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      error,
    })
    return res.status(400).json({
      success: false,
      message: "Les places n'ont pas pu être récupérées",
      error: error.nessage,
    })
  }
}

export const createPlaceByAdmin = async (req, res) => {
  const { centre, inspecteur, date } = req.body
  const loggerInfo = {
    section: 'admin-create-place',
    user: req.userId,
    centre,
    inspecteur,
    date,
  }
  try {
    const createdPlaceResult = await createPlaceForInspector(
      centre,
      inspecteur,
      date
    )
    appLogger.info({
      ...loggerInfo,
      action: 'created-place',
      description: `create by admin place: La place a bien été créée.`,
    })
    res.json({
      success: true,
      message: `La place du [${createdPlaceResult.date}] a bien été crée.`,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'error',
      description: `create by admin place: La place n'a pas été créée.`,
      error,
    })
    res.json({
      success: false,
      message: "La place n'a pas été créée",
      error: error.nessage,
    })
  }
}

export const deletePlaceByAdmin = async (req, res) => {
  const { id } = req.params
  const loggerInfo = {
    section: 'admin-delete-place',
    user: req.userId,
    id,
  }

  try {
    const place = await findPlaceById(id)

    if (!place) {
      const error = new Error(`La place id: [${id}] n'existe pas en base.`)
      error.messageToUser = "La place n'existe pas en base"
      throw error
    }

    if (place.candidat) {
      const error = new Error(
        `La place id: [${id}] vient d'être réservée par un candidat.`
      )
      error.messageToUser = 'La place est réservée par un candidat'
      throw error
    }

    await deletePlace(place)
    appLogger.info({
      ...loggerInfo,
      description: `delete place: La place id: [${id}] a bien été supprimée de la base.`,
    })
    const { date, hour } = dateTimeToFormatFr(place.date)
    res.json({
      success: true,
      message: `La place du [${date} ${hour}] a bien été supprimée de la base`,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      error,
    })
    res.status(400).json({
      success: false,
      message: error.messageToUser
        ? error.messageToUser
        : `La place id: [${id}] n'a pas été supprimée`,
      error: error.message,
    })
  }
}

export const updatePlaces = async (req, res) => {
  const { inspecteur, candidatId } = req.body
  const { id: placeId } = req.params

  const loggerContent = {
    section: 'admin-update-place',
    user: req.userId,
  }

  try {
    const admin = await findUserById(req.userId)
    if (!admin) {
      return res.status(403).send({
        success: false,
        message: 'Utilisateur non trouvé',
      })
    }

    if (placeId && inspecteur) {
      appLogger.info({
        ...loggerContent,
        placeId,
        inspecteur,
        action: 'UPDATE_RESA',
        description: `Changer l'inspecteur de la réservaton candidat`,
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
        description: `Affecter un candidat à une place`,
      })

      const result = await assignCandidatInPlace(candidatId, placeId, admin)
      const place = findPlaceById(placeId)
      sendMailConvocation(place)

      const { date, hour } = dateTimeToFormatFr(result.newBookedPlace.date)
      return res.send({
        success: true,
        message: `Le candidat Nom: [${result.candidat.nomNaissance}] Neph: [${result.candidat.codeNeph}] a bien été affecté à la place du ${date} à ${hour}`,
        place: result.newBookedPlace,
      })
    }
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      action: 'ERROR',
      description: error.message,
      error: error.stack,
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

  try {
    let results
    if (req.userLevel >= config.userStatusLevels.admin) {
      loggerContent.action = 'SEND_MAIL_SCHEDULE_ALL_INSPECTEURS'
      if (!date) {
        const error = new Error('Le paramètre date renseignés est manquant')
        error.status = 422
        throw error
      }
    } else {
      loggerContent.action = 'SEND_MAIL_SCHEDULE'
      if (!departement || !date) {
        const error = new Error('Les paramètres renseignés sont manquante')
        error.status = 422
        throw error
      }
    }

    if (departement) {
      appLogger.info({
        ...loggerContent,
        message: `Envoi du planning`,
      })
      const { email } = await findUserById(req.userId)
      const confDepartement = await findDepartementbyId(departement)
      const emailDepartement = confDepartement && confDepartement.email
      results = await sendMailSchedulesInspecteurs(
        emailDepartement || email,
        departement,
        date
      )
    } else {
      appLogger.info({
        ...loggerContent,
        message: `Envoi des plannings à les inspecteurs`,
      })
      results = await sendMailSchedulesAllInspecteurs(date)
    }

    res.status(results.success ? 200 : 400).send(results)
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      action: 'ERROR',
      error,
    })
    res.status(error.status || 500).send({
      success: false,
      message: error.message,
      error,
    })
  }
}
