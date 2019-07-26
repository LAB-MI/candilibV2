// import { synchroAurige, getCandidatsAsCsv } from './business'
import {
  DATETIME_FULL,
  email as emailRegex,
  getFrenchLuxonFromJSDate,
  techLogger,
} from '../../util'
import { appLogger } from '../../util/logger'
import {
  findCandidatByEmail,
  findCandidatById,
  deleteCandidat,
  updateCandidatById,
} from '../../models/candidat'
import {
  getDepartementFromWhitelist,
  isAlreadyPresignedUp,
  updateInfoCandidat,
  presignUpCandidat,
  validateEmail,
} from './candidat.business'
import { isMoreThan2HoursAgo } from '../admin/business/synchro-aurige'
import { createEvaluation } from '../../models/evaluation/evaluation.queries'
import {
  CANDIDAT_NOT_FOUND,
  CANDIDAT_ALREADY_EXIST,
  CANDIDAT_FIELD_EMPTY,
  CANDIDAT_EMAIL_NOT_VALID,
  CANDIDAT_ALREADY_PRESIGNUP,
} from './message.constants'

const mandatoryFields = [
  'codeNeph',
  'nomNaissance',
  'email',
  'portable',
  'adresse',
]

const trimEveryValue = obj =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = value && (typeof value === 'string' ? value.trim() : value)
    return acc
  }, {})

export async function preSignup (req, res) {
  const candidatData = trimEveryValue(req.body)

  const loggerInfo = {
    section: 'candidat',
    action: 'preSignup',
  }
  appLogger.info({ ...loggerInfo, candidatData })

  const { codeNeph, nomNaissance, portable, adresse, email } = candidatData

  const isFormFilled = [codeNeph, nomNaissance, email, portable, adresse].every(
    value => value
  )

  const isValidEmail = emailRegex.test(email)

  if (!isFormFilled) {
    const fieldsWithErrors = mandatoryFields
      .map(key => (candidatData[key] ? '' : key))
      .filter(e => e)

    if (!isValidEmail && !fieldsWithErrors.includes('email')) {
      fieldsWithErrors.push('email')
    }

    appLogger.error({ ...loggerInfo, fieldsWithErrors })

    res.status(400).json({
      success: false,
      message: CANDIDAT_FIELD_EMPTY,
      fieldsWithErrors,
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

  try {
    const departement = await getDepartementFromWhitelist(candidatData)
    appLogger.info({ ...loggerInfo, departementFromWhitelist: departement })
    // Forcer le département du candidat par le département de la whitelist correspondant à son email
    candidatData.departement = departement
  } catch (error) {
    techLogger.error({
      ...loggerInfo,
      error,
      function: 'getDepartementFromWhitelist',
      message: error.message,
    })
    res.status(401).json({
      success: false,
      message: error.message,
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
      appLogger.error({
        ...loggerInfo,
        check: 'isValidatedByAurige',
        message: CANDIDAT_ALREADY_EXIST,
      })
      res.status(409).json({
        success: false,
        message: CANDIDAT_ALREADY_EXIST,
      })
      return
    }

    if (isValidatedEmail) {
      appLogger.error({
        ...loggerInfo,
        check: 'isValidatedEmail',
        message: CANDIDAT_ALREADY_PRESIGNUP,
      })
      res.status(409).json({
        success: false,
        message: CANDIDAT_ALREADY_PRESIGNUP,
      })
      return
    }

    if (!isValidatedEmail && !isMoreThan2HoursAgo(presignedUpAt)) {
      const deadLineBeforeValidateEmail = getFrenchLuxonFromJSDate(
        presignedUpAt
      )
        .plus({ hours: 2 })
        .toLocaleString(DATETIME_FULL)
      const message = `Cette adresse courriel est déjà enregistrée, vous pourrez renouveler votre pré-inscription après le ${deadLineBeforeValidateEmail}.`
      appLogger.error({
        ...loggerInfo,
        check: 'deadLineBeforeValidateEmail',
        message,
      })
      res.status(409).json({
        success: false,
        message,
      })
      return
    }
    const result = await deleteCandidat(
      candidatWithSameEmail,
      'EMAIL_NOT_VERIFIED_EXPIRED'
    )
    appLogger.info({ ...loggerInfo, function: 'deleteCandidat', result })
  }

  const result = await isAlreadyPresignedUp(candidatData)

  if (!result.success) {
    appLogger.error({ ...loggerInfo, function: 'isAlreadyPresignedUp', result })
    res.status(409).json(result)
    return
  }

  if (!result.candidat) {
    try {
      const response = await presignUpCandidat(candidatData)
      appLogger.info({ ...loggerInfo, function: 'presignUpCandidat', result })
      res.status(200).json(response)
    } catch (error) {
      techLogger.error({
        section: 'candidat-presignup',
        error,
      })
      res.status(500).json({
        success: false,
        message:
          'Oups ! Une erreur est survenue lors de votre pré-inscription.',
      })
    }
    return
  }

  const updateResult = await updateInfoCandidat(result.candidat, candidatData)

  if (updateResult.success) {
    appLogger.info({
      ...loggerInfo,
      function: 'updateInfoCandidat',
      updateResult,
    })
    res.status(200).json(updateResult)
    return
  }
  appLogger.error({
    ...loggerInfo,
    function: 'updateInfoCandidat',
    updateResult,
  })
  res.status(409).json(updateResult)
}

export async function getMe (req, res) {
  try {
    const options = {
      _id: 0,
      nomNaissance: 1,
      prenom: 1,
      codeNeph: 1,
      email: 1,
      portable: 1,
      adresse: 1,
      departement: 1,
      isEvaluationDone: 1,
    }

    const candidat = await findCandidatById(req.userId, options)

    res.json({
      candidat,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}

export async function emailValidation (req, res) {
  const { email, hash } = req.body || {}
  try {
    const candidat = await findCandidatByEmail(email)

    if (!candidat) {
      throw new Error('Votre adresse courriel est inconnue.')
    }

    if (candidat.isValidatedEmail) {
      res.status(200).json({
        success: true,
        message: 'Votre adresse courriel est déjà validée.',
      })
      return
    }

    if (candidat.emailValidationHash !== hash) {
      throw new Error('Le hash ne correspond pas.')
    }

    const emailValidationResult = await validateEmail(email, hash)

    res.status(200).json(emailValidationResult)
  } catch (error) {
    res.status(422).json({
      success: false,
      message:
        'Impossible de valider votre adresse courriel : ' + error.message,
    })
  }
}

export async function saveEvaluation (req, res) {
  const { rating, comment } = req.body.evaluation || {}
  const candidatId = req.userId
  try {
    const candidat = findCandidatById(candidatId)
    if (candidat === null) {
      const error = new Error(CANDIDAT_NOT_FOUND)
      error.status = 400
      throw error
    }
    const evaluation = await createEvaluation({ rating, comment })
    candidat.isEvaluationDone = true
    updateCandidatById(candidatId, candidat)
    res.status(201).json({ success: true, evaluation })
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    })
  }
}
