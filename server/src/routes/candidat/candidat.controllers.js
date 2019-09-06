// import { synchroAurige, getCandidatsAsCsv } from './business'
import {
  DATETIME_FULL,
  email as emailRegex,
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
  getDepartementFromWhitelist,
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
} from './message.constants'
import { sendErrorResponse } from '../../util/send-error-response'

const mandatoryFields = [
  'adresse',
  'codeNeph',
  'email',
  'nomNaissance',
  'portable',
]

const trimEveryValue = obj =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = value && (typeof value === 'string' ? value.trim() : value)
    return acc
  }, {})

export async function preSignup (req, res) {
  const candidatData = trimEveryValue(req.body)

  const loggerInfo = {
    section: 'candidat-pre-signup',
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

    if (departement === null) {
      const message = `L'adresse courriel renseignée (${email}) n'est pas dans la liste des invités`
      appLogger.warn({
        section: 'candidat-pre-signup',
        action: 'check-email-is-in-whitelist',
        description: message,
        candidatDepartement: departement,
      })
      return res.status(401).json({
        success: false,
        message,
      })
    }

    appLogger.info({ ...loggerInfo, departementFromWhitelist: departement })

    // Forcer le département du candidat par le département de la whitelist correspondant à son email
    candidatData.departement = departement
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      error,
      function: 'getDepartementFromWhitelist',
      description: error.message,
    })
    res.status(401).json({
      success: false,
      message:
        "Une erreur est survenue, impossible de vous pré-enregistrer. L'administrateur a été prévenu.",
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
        presignedUpAt
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
      'EMAIL_NOT_VERIFIED_EXPIRED'
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

export async function getMe (req, res) {
  try {
    const options = {
      _id: 0,
      adresse: 1,
      codeNeph: 1,
      departement: 1,
      email: 1,
      isEvaluationDone: 1,
      nomNaissance: 1,
      portable: 1,
      prenom: 1,
    }

    const candidat = await findCandidatById(req.userId, options)

    res.json({
      candidat,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Oups, un problème est survenu, impossible de valider votre adresse courriel. L'administrateur a été prévenu.",
    })
  }
}

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
    updateCandidatById(candidatId, candidat)

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
