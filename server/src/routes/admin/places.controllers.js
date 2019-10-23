/**
 * Module concernant les actions sur les places par un utilisateur
 * @module routes/admin/places-controllers
 */
import config from '../../config'
import {
  deletePlace,
  findAllPlaces,
  findPlaceById,
  findPlacesByCentreAndDate,
} from '../../models/place'

import { findCandidatById } from '../../models/candidat'

import { findUserById } from '../../models/user'
import { findDepartementById } from '../../models/departement'
import {
  appLogger,
  getFrenchFormattedDateTime,
  ErrorWithStatus,
} from '../../util'
import { findCentresWithPlaces } from '../common/centre.business'
import {
  assignCandidatInPlace,
  createPlaceForInspector,
  importPlacesFromFile,
  moveCandidatInPlaces,
  removeReservationPlaceByAdmin,
  sendMailSchedulesAllInspecteurs,
  sendMailSchedulesInspecteurs,
  validUpdateResaInspector,
} from './places.business'

import {
  DELETE_PLACES_BY_ADMIN_SUCCESS,
  DELETE_PLACES_BY_ADMIN_ERROR,
  USER_NOT_FOUND,
  UNKNOWN_ERROR_SEND_SCHEDULE_INSPECTEUR,
} from './message.constants'

/**
 * Importer le planning des insporteurs pour un département avec un fichier CSV ou XLSX.
 * Le planning est une list de places contenant les informations dans l'ordre suivant: date, heure, matricule de l'inspecteur, le nom de l'inspecteur, le nom centre et le département.
 * La fonction metier appelée est [importPlacesFromFile]{@link module:routes/admin/places-business.importPlacesFromFile}
 * @async
 * @function
 * @see {@link http://localhost:8000/api-docs/#/Administrateur/post_admin_places|Swagger: POST /admin/places}
 * @see {@link https://expressjs.com/fr/4x/api.html#req|Documentation: express Request}
 * @see {@link https://expressjs.com/fr/4x/api.html#res|Documentation: express Response}
 * @param {import('express').Request} req
 * @param {File} req.files fichiers en format CSV ou XLSX
 * @param {Object} req.body
 * @param {String} req.body.departement departement selectionné par l'utilisateur
 * @param {import('express').Response} res

 */
export const importPlaces = async (req, res) => {
  const { departement } = req.body

  const loggerInfo = {
    section: 'admin-import-places',
    admin: req.userId,
    departement,
  }
  const files = req.files
  if (!files || !files.file) {
    const message = 'Fichier manquant'
    appLogger.warn({ ...loggerInfo, description: message })
    res.status(400).json({
      success: false,
      message,
    })
    return
  }

  try {
    const planningFile = files.file
    loggerInfo.filename = planningFile.name

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
    if (error.from) {
      appLogger.warn({
        ...loggerInfo,
        description: error.message,
        error,
      })
      res.status(400).send({
        success: false,
        message: error.message,
      })
    } else {
      appLogger.error({
        ...loggerInfo,
        description: error.message,
        error,
      })
      res.status(500).send({
        success: false,
        message: error.message,
      })
    }
  }
}

export const getPlaces = async (req, res) => {
  let places
  const { departement, beginDate, endDate, centre, date } = req.query

  const loggerInfo = {
    section: 'admin-get-places',
    admin: req.userId,
    departement,
    beginDate,
    endDate,
    cnetreId: centre,
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
      description: `${places ? places.length : 0} places trouvées`,
    })
    res.json(places)
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
    return res.status(500).json({
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
    admin: req.userId,
    centreId: centre._id,
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
      description: 'create by admin place: La place a bien été créée.',
    })
    res.json({
      success: true,
      message: `La place du [${createdPlaceResult.date}] a bien été crée.`,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'error',
      description: "create by admin place: La place n'a pas été créée.",
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
    admin: req.userId,
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
    const { date, hour } = getFrenchFormattedDateTime(place.date)
    res.json({
      success: true,
      message: `La place du [${date} ${hour}] a bien été supprimée de la base`,
    })
  } catch (error) {
    if (error.messageToUser) {
      appLogger.warn({
        ...loggerInfo,
        description: error.message,
        error,
      })
      res.status(400).json({
        success: false,
        message: error.messageToUser,
        error: error.message,
      })
    } else {
      appLogger.error({
        ...loggerInfo,
        description: error.message,
        error,
      })
      res.status(500).json({
        success: false,
        message: `La place id: [${id}] n'a pas été supprimée`,
        error: error.message,
      })
    }
  }
}

export const deletePlacesByAdmin = async (req, res) => {
  const adminId = req.userId
  const { placesToDelete } = req.body

  const loggerInfo = {
    section: 'admin-delete-places',
    admin: adminId,
    placesToDelete,
  }

  if (!placesToDelete || !placesToDelete.length) {
    appLogger.warn({
      ...loggerInfo,
      description: DELETE_PLACES_BY_ADMIN_ERROR,
    })
    res.status(422).json({
      success: false,
      message: DELETE_PLACES_BY_ADMIN_ERROR,
    })
    return
  }
  appLogger.info({
    ...loggerInfo,
    description: 'Places à supprimer',
  })

  try {
    await Promise.all(
      placesToDelete.map(async placeId => {
        const placeFound = await findPlaceById(placeId)
        if (!placeFound) {
          appLogger.warn({
            ...loggerInfo,
            placeId,
            action: 'DELETE_RESA_NOT_FOUND',
            description: `La place selectionnée avec l'id: [${placeId}] a déjà été supprimée`,
          })
          return
        }
        const { candidat } = placeFound
        if (candidat) {
          const candidatFound = await findCandidatById(candidat)
          if (candidatFound) {
            const {
              statusmail,
              messsage,
            } = await removeReservationPlaceByAdmin(
              placeFound,
              candidatFound,
              adminId
            )
            appLogger.info({
              ...loggerInfo,
              placeId,
              candidatId: candidat._id,
              action: 'DELETE_RESA',
              description:
                'Remove booked Place By Admin and send email to candidat',
              result: {
                statusmail,
                messsage,
              },
            })
            return
          }
        }
        const removedPlace = await deletePlace(placeFound)
        appLogger.info({
          ...loggerInfo,
          action: 'DELETE_PLACE',
          description: 'Remove Place By Admin',
          place: {
            _id: removedPlace._id,
            centreId: removedPlace.centre._id,
            inspecteurId: removedPlace.inspecteur._id,
            date: removedPlace.date,
            candidatId: removedPlace.candidat && removedPlace.candidat._id,
          },
        })
      })
    )

    appLogger.info({
      ...loggerInfo,
      description: DELETE_PLACES_BY_ADMIN_SUCCESS,
    })

    res.status(200).json({
      success: true,
      message: DELETE_PLACES_BY_ADMIN_SUCCESS,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'ERROR_DELETE_PLACES',
      description: error.message,
      error,
    })
    res.status(400).json({ success: false, message: error.message })
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
    const admin = await findUserById(req.userId)
    if (!admin) {
      const message = USER_NOT_FOUND
      appLogger.error({ ...loggerContent, description: message })
      return res.status(403).send({
        success: false,
        message,
      })
    }

    if (placeId && inspecteur) {
      appLogger.info({
        ...loggerContent,
        placeId,
        inspecteur,
        action: 'UPDATE_INSPECTEUR_RESA',
        description: "Changer l'inspecteur de la réservaton candidat",
      })

      loggerContent.action = 'VALIDATE_PARAM_TO_UPDATE_RESA'
      const result = await validUpdateResaInspector(placeId, inspecteur)
      loggerContent.action = 'MOVE_CANDIDAT_TO_UPDATE_RESA'
      const newResa = await moveCandidatInPlaces(result.resa, result.place)

      appLogger.info({
        ...loggerContent,
        placeId,
        inspecteur,
        newResa,
        action: 'INSPECTEUR_RESA_UPDATED',
        description: "Changer l'inspecteur de la réservaton candidat",
      })
      return res.json({
        success: true,
        message: 'La modification est confirmée.',
        place: newResa,
      })
    }

    if (placeId && candidatId) {
      appLogger.info({
        ...loggerContent,
        placeId,
        candidatId,
        action: 'UPDATE_PLACE',
        description: 'Affecter un candidat à une place',
      })

      const result = await assignCandidatInPlace(candidatId, placeId, admin)
      const { date, hour } = getFrenchFormattedDateTime(
        result.newBookedPlace.date
      )

      const {
        _id,
        centre,
        candidat,
        date: bookedDate,
        inspecteur,
      } = result.newBookedPlace

      appLogger.info({
        ...loggerContent,
        placeId,
        candidatId,
        action: 'PLACE_UPDATED',
        description: 'Place réservée pour le candidat',
      })

      return res.json({
        success: true,
        message: `Le candidat Nom: [${result.candidat.nomNaissance}] Neph: [${result.candidat.codeNeph}] a bien été affecté à la place du ${date} à ${hour}`,
        place: {
          _id,
          centre: centre._id,
          inspecteur,
          candidat: candidat._id,
          date: bookedDate,
        },
      })
    }
  } catch (error) {
    let loggerFct = appLogger.error
    let status = 500

    if (error instanceof ErrorWithStatus) {
      loggerFct = appLogger.warn
      status = error.status
    }

    loggerFct({
      ...loggerContent,
      action: loggerContent.action || 'ERROR',
      description: error.message,
      error: error.stack,
    })

    return res.status(status).json({
      success: false,
      message: error.message,
    })
  }

  res.status(422).json({
    success: false,
    message: 'Les paramètres renseignés sont incorrects',
  })
}

export const sendScheduleInspecteurs = async (req, res) => {
  const { departement, date, isForInspecteurs } = req.body
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
        message: 'Envoyer des bordereaux des inspecteurs pour un departement',
      })
      const { email } = await findUserById(req.userId)
      const confDepartement = await findDepartementById(departement)
      const emailDepartement = confDepartement && confDepartement.email
      results = await sendMailSchedulesInspecteurs(
        emailDepartement || email,
        departement,
        date,
        isForInspecteurs
      )
    } else {
      appLogger.info({
        ...loggerContent,
        message: 'Envoyer des bordereaux à les inspecteurs',
      })
      results = await sendMailSchedulesAllInspecteurs(date)
    }

    appLogger.info({
      ...loggerContent,
      message: 'Les bordereaux ont été envoyés',
    })
    res.status(results.success ? 200 : 400).send(results)
  } catch (error) {
    const loggerFct = error.status ? appLogger.error : appLogger.warn
    const action = loggerContent.action || 'ERROR'

    loggerFct({
      ...loggerContent,
      action,
      description: error.message,
      error,
    })

    res.status(error.status || 500).send({
      success: false,
      message: error.status
        ? error.message
        : UNKNOWN_ERROR_SEND_SCHEDULE_INSPECTEUR,
    })
  }
}
