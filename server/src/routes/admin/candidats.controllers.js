/**
 * Contrôleur regroupant les fonctions candidats à l'attention des répartiteurs
 * @module routes/admin/candidats-controllers
 */
import { appLogger } from '../../util/logger'
import {
  synchroAurige,
  getCandidatsAsCsv,
  getBookedCandidatsAsCsv,
} from './business'
import {
  findAllCandidatsLean,
  findBookedCandidats,
  findCandidatsMatching,
  findCandidatById,
} from '../../models/candidat'
import { findPlaceByCandidatId } from '../../models/place'
import { statutReasonDictionnary } from '../common/reason.constants'
import { UNKNOW_ERROR_GET_CANDIDAT } from './message.constants'

/**
 * Importe le fichier JSON d'aurige
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {File} req.files.file Fichier JSON à synchroniser
 * @param {import('express').Response} res
 */
export const importCandidats = async (req, res) => {
  const loggerInfo = {
    section: 'admin-import-candidats',
    admin: req.userId,
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

  const jsonFile = files.file

  try {
    loggerInfo.filename = jsonFile.name
    appLogger.info({ ...loggerInfo })

    const result = await synchroAurige(jsonFile.data)
    const message = `Le fichier ${jsonFile.name} a été synchronisé.`
    appLogger.info({
      ...loggerInfo,
      description: message,
      nbCandidats: result ? result.length : 0,
    })
    res.status(200).send({
      fileName: jsonFile.name,
      success: true,
      message,
      candidats: result,
    })
  } catch (error) {
    appLogger.error({ ...loggerInfo, error })
    return res.status(500).send({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Exporte la liste des candidats sous forme de CSV
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {Candidat[]} req.candidats Les candidats sélectionnés
 * @param {import('express').Response} res
 */
export const exportCandidats = async (req, res) => {
  appLogger.info({
    section: 'admin-export-cvs',
    action: 'candidats',
    admin: req.userId,
  })

  const candidatsAsCsv = await getCandidatsAsCsv(req.candidats)
  const filename = 'candidatsLibresPrintel.csv'
  res
    .status(200)
    .attachment(filename)
    .send(candidatsAsCsv)
}

/**
 * Exporte la liste des candidats possédant une réservation sous forme de CSV
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {Candidat[]} req.candidats Les candidats sélectionnés
 * @param {import('express').Response} res
 */
export const exportBookedCandidats = async (req, res) => {
  appLogger.info({
    section: 'admin-export-cvs',
    action: 'booked-candidats',
    admin: req.userId,
  })

  const candidatsAsCsv = await getBookedCandidatsAsCsv(req.candidats)
  const filename = 'candidatsLibresReserve.csv'
  res
    .status(200)
    .attachment(filename)
    .send(candidatsAsCsv)
}

/**
 * Récupère les informations d'un ou plusieurs candidats
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 *
 * @param {Object} req.params
 * @param {string} req.params.candidatId Id du candidat recherché
 *
 * @param {Object} req.query
 * @param {string} req.query.matching Une chaîne de caractères pour chercher un candidat
 * @param {string} req.query.format Si csv, exporte les candidats au format csv
 * @param {string} req.query.for But de l'opération (ex: aurige)
 *
 * @param {import('express').Response} res
 */
export const getCandidats = async (req, res) => {
  const section = 'admin-get-candidats'
  const loggerInfo = {
    section,
    admin: req.userId,
  }
  const { id: candidatId } = req.params
  try {
    // Obtenir les informations d'un candidat
    if (candidatId) {
      loggerInfo.action = 'INFO-CANDIDAT'
      loggerInfo.candidatId = candidatId
      appLogger.info(loggerInfo)

      const candidatFound = await findCandidatById(candidatId)

      if (candidatFound) {
        const placeFound = await findPlaceByCandidatId(candidatId, true)
        const candidat = candidatFound.toObject()
        candidat.places =
          candidat.places &&
          candidat.places.map(place => {
            const humanReadableReason =
              statutReasonDictionnary[place.archiveReason]
            return {
              ...place,
              archiveReason: humanReadableReason,
            }
          })
        res.json({
          success: true,
          candidat: { ...candidat, place: placeFound },
        })
        return
      }

      const message = "Le candidat n'existe pas"
      appLogger.warn({ ...loggerInfo, description: message })
      res.json({ success: false, message })
      return
    }

    const { matching, format, filter, for: actionAsk } = req.query

    // Rechercher des candiats
    if (matching) {
      loggerInfo.action = 'SEARCH-CANDIDAT'
      loggerInfo.matching = matching
      appLogger.info(loggerInfo)

      const candidats = await findCandidatsMatching(matching)
      res.json(candidats)
      return
    }

    // Obtenir la list des candidats
    // TODO: A revoir : Performance et utilité
    loggerInfo.action = 'INFO-CANDIDATS'
    loggerInfo.filter = filter
    loggerInfo.format = format
    appLogger.info(loggerInfo)

    const candidatsLean = await findAllCandidatsLean()
    appLogger.debug({ ...loggerInfo, candidatsLean })
    let candidats
    if (actionAsk === 'aurige') {
      candidats = candidatsLean
    } else {
      candidats = await Promise.all(
        candidatsLean.map(async candidat => {
          const { _id } = candidat
          const places = await findPlaceByCandidatId(_id)
          if (places && places.length > 1) {
            appLogger.warn({
              ...loggerInfo,
              candidatId: _id,
              description: `Le candidat ${candidat.codeNeph} / '${candidat.nomNaissance} a plusieurs places d'examens`,
            })
          }
          candidat.place = (places && places[0]) || {}
          return candidat
        })
      )
    }
    if (format && format === 'csv') {
      req.candidats = candidats
      exportCandidats(req, res)
      return
    }
    res.json(candidats)
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: UNKNOW_ERROR_GET_CANDIDAT,
      error,
    })
    return res.status(500).send({
      success: false,
      message: UNKNOW_ERROR_GET_CANDIDAT,
      error,
    })
  }
}

/**
 * Récupère les informations des candidats ayant une réservation
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {Candidat[]} req.candidats Les candidats sélectionnés
 * @param {import('express').Response} res
 */
export const getBookedCandidats = async (req, res) => {
  const {
    query: { format, date, inspecteur, centre },
  } = req

  appLogger.info({
    section: 'admin-get-booked-candidats',
    admin: req.userId,
    format,
    date,
    inspecteur,
    centreId: centre,
  })

  const candidats = await findBookedCandidats(date, inspecteur, centre)

  if (format && format === 'csv') {
    req.candidats = candidats
    exportBookedCandidats(req, res)
    return
  }
  res.json(candidats)
}

/**
 * @typedef {Object} Candidat Objet candidat dans la base de données
 * @param {boolean} isValidatedByAurige Vaut `true` si le candidat a été validé par aurige
 * @param {boolean} isValidatedEmail Vaut `true` si le candidat a validé son adresse courriel
 * @param {number} nbEchecsPratiques Nombre d'échecs du candidat à l'épreuve pratique
 * @param {string} _id Identifiant du candidat
 * @param {string} adresse Adresse postale du candidat où lui seront envoyés les correspondances de l'adminstation
 * @param {string} codeNeph NEPH du candidat
 * @param {string} email Adresse courriel du candidat
 * @param {string} emailValidationHash Hash de validation du courriel
 * @param {string} nomNaissance Nom de naissance du candidat
 * @param {string} portable Numéro de mobile du candidat
 * @param {string} prenom Prénom du candidat
 * @param {string} presignedUpAt Date et heure de la préinscription du candidat
 * @param {string} departement Département du candidat
 * @param {NoReussite[]} noReussites Liste des précédents échecs à l'épreuve pratique et causes
 * @param {string} canBookFrom Date et heure à partir de laquelle le candidat peut réserver une place
 * @param {string} dateReussiteETG Date et heure de la réussite de l'épreuve théorique
 * @param {string} firstConnection Date et heure de la première connexion à Candilib
 * @param {Place[]} places Liste des places réservées par le candidat
 * @param {string} resaCanceledByAdmin Date et heure de la dernière annulation de place faite par un administrateur
 *
 * @typedef {Object} NoReussite
 * @param {string} _id Identifiant de l'échec
 * @param {string} date Date et heure de l'échec
 * @param {string} reason Raison de l'échec
 *
 * @typedef {Object} Place Informations sur la place
 * @param {string} _id Identifiant de la place
 * @param {string} inspecteur Identifiant de l'inspecteur affecté à la place
 * @param {string} centre Identifiant du centre d'examen
 * @param {string} date Date et heure de l'examen
 * @param {string} archivedAt Date et heure à laquelle la place a été archivée
 * @param {string} archiveReason Raison pour l'archivage de la place
 * @param {string} byUser Adresse courriel de l'utilisateur responsable de l'archivage
 * @param {string} bookedAt Date et heure à laquelle la réservation a été prise
 * @param {Object} bookedByAdmin Information sur l'administrateur ayant fait la réservation, si applicable
 * @param {string} bookedByAdmin._id Identifiant de l'administrateur
 * @param {string[]} bookedByAdmin.departements Liste des Départements accessibles par l'administrateur
 * @param {string} bookedByAdmin.signUpDate Date et heure à laquelle l'administrateur à été créé
 * @param {string} bookedByAdmin.status Role de l'administrateur, par exemple répartiteur
 * @param {string} bookedByAdmin.email Adresse courriel de l'administrateur
 */
