/**
 * Module concernant les actions du candidat
 * @module routes/candidat/candidat-controllers
 */

import {
  DATETIME_FULL,
  email as emailRegex,
  firstNameAndLastName as firstNameAndLastNameRegex,
  EMAIL_NOT_VERIFIED_EXPIRED,
  getFrenchLuxonFromJSDate,
} from '../../util'
import { appLogger } from '../../util/logger'
import {
  deleteCandidat,
  findCandidatByEmail,
  findCandidatById,
  updateCandidatById,
} from '../../models/candidat'
import {
  isAlreadyPresignedUp,
  presignUpCandidat,
  updateInfoCandidat,
  validateEmail,
} from './candidat.business'
import { isMoreThan2HoursAgo } from '../admin/business/synchro-aurige'
import { createEvaluation } from '../../models/evaluation/evaluation.queries'
import {
  CANDIDAT_ALREADY_EXIST,
  CANDIDAT_ALREADY_PRESIGNUP,
  CANDIDAT_EMAIL_NOT_VALID,
  CANDIDAT_FIELD_EMPTY,
  CANDIDAT_NOT_FOUND,
  DEPARTEMENT_LIST,
  CANDIDAT_LAST_NAME_NOT_VALID,
  CANDIDAT_FIRST_NAME_NOT_VALID,
} from './message.constants'
import { sendErrorResponse } from '../../util/send-error-response'
import { isDepartementExisting } from '../../models/departement'

/**
 * @constant {string[]} - Liste des noms des champs requis
 */
const mandatoryFields = [
  'codeNeph',
  'email',
  'nomNaissance',
  'prenom',
  'portable',
  'departement',
]

/**
 * Supprime les espaces en début et en fin de chacune des valeurs de l'objet s'il s'agit
 * de chaîne de caractères
 *
 * @function
 *
 * @param {Object} - Objet avec des propriétés dont certaines valeurs sont des chaînes de
 *                   caractères et sont susceptibles d'avoir des espaces blancs en trop
 *
 * @returns {Object} - Objet avec les valeurs de propriétés dont les espaces blancs
 *                     en début et en fin de chaîne sont supprimés
 */
const trimEveryValue = obj =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = value && (typeof value === 'string' ? value.trim() : value)
    return acc
  }, {})

/**
 * Préinscrit le candidat
 *
 * @async
 * @function
 *
 * @see {@link http://localhost:8000/api-docs/#/default/post_candidat_preinscription}
 *
 * @param {import('express').Request} req
 * @param {Object} req.body
 * @param {Object} req.candidatData
 * @param {Object} res
 */
export async function preSignup (req, res) {
  const candidatData = trimEveryValue(req.body)

  const loggerInfo = {
    section: 'candidat-pre-signup',
    action: 'preSignup',
  }
  appLogger.info({ ...loggerInfo, candidatData })

  const { email, departement, nomNaissance, prenom } = candidatData

  const fieldsWithErrors = mandatoryFields
    .map(key => (candidatData[key] ? '' : key))
    .filter(e => e)

  const isValidEmail = emailRegex.test(email)
  const isInvalidLastName = firstNameAndLastNameRegex.test(nomNaissance)
  const isInvalidFirstName = firstNameAndLastNameRegex.test(prenom)

  if (fieldsWithErrors.length) {
    appLogger.error({ ...loggerInfo, fieldsWithErrors })

    res.status(400).json({
      success: false,
      message: CANDIDAT_FIELD_EMPTY,
      fieldsWithErrors,
    })
    return
  }

  const isDeptExist = await isDepartementExisting(departement)

  if (!isDeptExist) {
    res.status(400).json({
      success: false,
      message: DEPARTEMENT_LIST,
    })
    return
  }

  if (!isValidEmail) {
    appLogger.error({ ...loggerInfo, fieldsWithErrors: ['email'] })
    res.status(400).json({
      success: false,
      message: CANDIDAT_EMAIL_NOT_VALID,
      fieldsWithErrors: ['email'],
    })
    return
  }

  if (isInvalidLastName) {
    appLogger.error({ ...loggerInfo, fieldsWithErrors: ['nomNaissance'] })
    res.status(400).json({
      success: false,
      message: CANDIDAT_LAST_NAME_NOT_VALID,
      fieldsWithErrors: ['nomNaissance'],
    })
    return
  }

  if (isInvalidFirstName) {
    appLogger.error({ ...loggerInfo, fieldsWithErrors: ['prenom'] })
    res.status(400).json({
      success: false,
      message: CANDIDAT_FIRST_NAME_NOT_VALID,
      fieldsWithErrors: ['prenom'],
    })
    return
  }

  const candidatWithSameEmail = await findCandidatByEmail(email)

  if (candidatWithSameEmail) {
    const {
      isValidatedByAurige,
      isValidatedEmail,
      presignedUpAt,
    } = candidatWithSameEmail

    if (isValidatedByAurige) {
      appLogger.warn({
        ...loggerInfo,
        check: 'isValidatedByAurige',
        description: CANDIDAT_ALREADY_EXIST,
      })
      res.status(409).json({
        success: false,
        message: CANDIDAT_ALREADY_EXIST,
      })
      return
    }

    if (isValidatedEmail) {
      appLogger.warn({
        ...loggerInfo,
        check: 'isValidatedEmail',
        description: CANDIDAT_ALREADY_PRESIGNUP,
      })
      res.status(409).json({
        success: false,
        message: CANDIDAT_ALREADY_PRESIGNUP,
      })
      return
    }

    if (!isValidatedEmail && !isMoreThan2HoursAgo(presignedUpAt)) {
      const deadlineBeforeValidateEmail = getFrenchLuxonFromJSDate(
        presignedUpAt,
      )
        .plus({ hours: 2 })
        .toLocaleString(DATETIME_FULL)
      const message = `Cette adresse courriel est déjà enregistrée, vous pourrez renouveler votre pré-inscription après le ${deadlineBeforeValidateEmail}.`
      appLogger.warn({
        ...loggerInfo,
        check: 'deadlineBeforeValidateEmail',
        description: message,
      })
      res.status(409).json({
        success: false,
        message,
      })
      return
    }
    const result = await deleteCandidat(
      candidatWithSameEmail,
      'EMAIL_NOT_VERIFIED_EXPIRED',
    )
    appLogger.info({ ...loggerInfo, function: 'deleteCandidat', result })
  }

  const result = await isAlreadyPresignedUp(candidatData)

  if (!result.success) {
    appLogger.warn({ ...loggerInfo, function: 'isAlreadyPresignedUp', result })
    res.status(409).json(result)
    return
  }

  if (!result.candidat) {
    try {
      const response = await presignUpCandidat(candidatData)
      appLogger.info({
        ...loggerInfo,
        function: 'presignUpCandidat',
        description: `Candidat ${candidatData.codeNeph} préinscrit`,
      })
      res.status(200).json(response)
    } catch (error) {
      appLogger.error({
        section: 'candidat-pre-signup',
        description: error.message,
        error,
      })
      res.status(500).json({
        success: false,
        message:
          "Oups ! Une erreur est survenue lors de votre pré-inscription. L'administrateur a été prévenu.",
      })
    }
    return
  }

  const updateResult = await updateInfoCandidat(result.candidat, candidatData)

  if (!updateResult.success) {
    appLogger.warn({
      ...loggerInfo,
      function: 'updateInfoCandidat',
      description: updateResult.message,
    })
    res.status(409).json(updateResult)
    return
  }

  appLogger.info({
    ...loggerInfo,
    function: 'updateInfoCandidat',
    updateResult,
  })
  res.status(200).json(updateResult)
}

/**
 * Récupère les informations du candidat
 *
 * @async
 * @function
 * @see {@link http://localhost:8000/api-docs/#/Candidat/get_candidat_me}
 *
 * @param {import('express').Request} req - Requête
 * @param {string} req.userId - Identifiant du candidat (mis sur la requête par le middleware verifyToken)
 * @param {Object} res - Réponse
 */
export async function getMe (req, res) {
  try {
    const options = {
      _id: 0,
      adresse: 1,
      codeNeph: 1,
      homeDepartement: 1,
      departement: 1,
      email: 1,
      isEvaluationDone: 1,
      nomNaissance: 1,
      portable: 1,
      prenom: 1,
    }

    const candidat = await findCandidatById(req.userId, options)
    // Pour corriger les anciennes donnés
    candidat.homeDepartement = candidat.homeDepartement || candidat.departement

    res.json({
      candidat,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        "Oups, un problème est survenu, impossible de valider votre adresse courriel. L'administrateur a été prévenu.",
    })
  }
}

/**
 * Met à jour le candidat en marquant son adresse courriel comme validée
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req - Requête
 * @param {Object} req.body - Corps de la requête
 * @param {Object} req.body.email - Adresse courriel du candidat
 * @param {Object} req.body.hash - Hash contenu dans le lien de validation de l'email
 * @param {Object} res - Réponse
 *
 * @see {@link http://localhost:8000/api-docs/#/default/put_candidat_me}
 */
export async function emailValidation (req, res) {
  const { email, hash } = req.body || {}

  const loggerInfo = {
    section: 'candidat-validate-email',
    func: 'emailValidation',
    email,
    hash,
  }

  try {
    const candidat = await findCandidatByEmail(email)

    if (!candidat) {
      return sendErrorResponse(res, {
        loggerInfo,
        message: 'Votre adresse courriel est inconnue',
        status: 404,
      })
    }

    const { codeNeph, isValidatedEmail, nomNaissance, presignedUpAt } = candidat

    if (isValidatedEmail) {
      appLogger.warn({
        ...loggerInfo,
        description: `L'adresse courriel ${email} est déjà validée`,
      })
      res.status(200).json({
        success: true,
        message: 'Votre adresse courriel est déjà validée',
      })
      return
    }

    if (isMoreThan2HoursAgo(presignedUpAt)) {
      const message = `Candidat ${codeNeph}/${nomNaissance} courriel non vérifié depuis plus de 2h, vous devez refaire la pré-inscription`
      appLogger.warn({ ...loggerInfo, description: message })
      await deleteCandidat(candidat, EMAIL_NOT_VERIFIED_EXPIRED)
      res.status(422).json({
        success: false,
        message,
      })
      return
    }

    const emailValidationResult = await validateEmail(email, hash)

    res
      .status(emailValidationResult.success ? 200 : 401)
      .json(emailValidationResult)
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
    res.status(500).json({
      success: false,
      message:
        "Oups, un problème est survenu, impossible de valider votre adresse courriel. L'administrateur a été prévenu.",
    })
  }
}

/**
 * Enregistre l'évaluation du candidat dans la base de données
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req - Requête
 * @param {Object} req.body - Corps de la requête
 * @param {Object} req.body.rating - Notation de l'application par le candidat
 * @param {Object} req.body.comment - Commentaire de l'application par le candidat
 * @param {Object} res - Réponse
 */
export async function saveEvaluation (req, res) {
  const { rating, comment } = req.body.evaluation || {}
  const candidatId = req.userId

  const loggerInfo = {
    section: 'save-evaluation',
  }

  try {
    const candidat = findCandidatById(candidatId)

    if (candidat === null) {
      appLogger.error({
        ...loggerInfo,
        description: `Impossible de trouver le candidat avec l'id ${candidatId}`,
      })

      res.status(400).json({
        success: false,
        message: CANDIDAT_NOT_FOUND,
      })
    }

    const evaluation = await createEvaluation({ rating, comment })
    candidat.isEvaluationDone = true
    await updateCandidatById(candidatId, candidat)

    appLogger.info({ ...loggerInfo, description: 'Évaluation enregistrée' })

    res.status(201).json({ success: true, evaluation })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: `Impossible d'enregistrer l'évaluation : ${error.message}`,
      error,
    })

    res.status(error.status || 500).json({
      success: false,
      message:
        "Impossible d'enregistrer l'évaluation. L'administrateur a été prévenu.",
    })
  }
}
