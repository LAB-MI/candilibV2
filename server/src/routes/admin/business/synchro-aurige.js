import { DateTime } from 'luxon'
import latinize from 'latinize'

import config from '../../../config'
import {
  deleteCandidat,
  findCandidatByNomNeph,
  addPlaceToArchive,
} from '../../../models/candidat'
import {
  findPlaceBookedByCandidat,
  removeBookedPlace,
} from '../../../models/place'
import {
  appLogger,
  CANDIDAT_EXISTANT,
  CANDIDAT_NOK,
  CANDIDAT_NOK_NOM,
  createToken,
  EMAIL_NOT_VERIFIED_EXPIRED,
  EMAIL_NOT_VERIFIED_YET,
  EPREUVE_ETG_KO,
  EPREUVE_PRATIQUE_OK,
  getFrenchLuxonFromISO,
  getFrenchLuxonFromJSDate,
  NOT_FOUND,
  NO_NAME,
  OK,
  OK_MAIL_PB,
  OK_UPDATED,
  NB_FAILURES_KO,
  NO_CANDILIB,
  getFrenchLuxon,
} from '../../../util'
import {
  sendFailureExam,
  sendMagicLink,
  sendMailToAccount,
} from '../../business'
import { getCandBookFrom } from '../../candidat/places.business'
import { REASON_EXAM_FAILED } from '../../common/reason.constants'

const getCandidatStatus = (nom, neph, status, details, message) => ({
  nom,
  neph,
  status,
  details,
  message,
})

export const isETGExpired = dateReussiteETG => {
  let datetime
  if (dateReussiteETG instanceof DateTime) {
    datetime = dateReussiteETG
  } else if (dateReussiteETG instanceof Date) {
    datetime = getFrenchLuxonFromJSDate(dateReussiteETG)
  } else {
    datetime = getFrenchLuxonFromISO(dateReussiteETG)
  }
  return datetime.diffNow('years').years < -5
}

export const isMoreThan2HoursAgo = date =>
  getFrenchLuxonFromJSDate(date).diffNow('hours').hours < -2

const isTooManyFailure = nbFailed => {
  return nbFailed === 5
}

const checkCandidatFound = async (candidat, loggerInfoCandidat) => {
  const { codeNeph, nomNaissance } = loggerInfoCandidat.candidatAurige

  if (!candidat) {
    const message = `Ce candidat ${codeNeph}/${nomNaissance} est inconnu de Candilib`
    appLogger.warn({ ...loggerInfoCandidat, description: message })
    return getCandidatStatus(
      nomNaissance,
      codeNeph,
      'error',
      NOT_FOUND,
      message
    )
  }

  const { isValidatedEmail, presignedUpAt, departement, email } = candidat

  // Vérifier la validité de l'e-mail
  if (!isValidatedEmail) {
    if (isMoreThan2HoursAgo(presignedUpAt)) {
      await deleteCandidat(candidat, 'EMAIL_NOT_VERIFIED_EXPIRED')
      const message = `Pour le ${departement}, Ce candidat ${email} sera archivé : email non vérifié depuis plus de 2h`
      appLogger.warn({ ...loggerInfoCandidat, description: message })
      return getCandidatStatus(
        nomNaissance,
        codeNeph,
        'error',
        EMAIL_NOT_VERIFIED_EXPIRED,
        message
      )
    }
    const message = `Pour le ${departement}, ce candidat ${email} n'a pas validé son email, il est inscrit depuis moins de 2h`
    appLogger.warn({ ...loggerInfoCandidat, description: message })
    return getCandidatStatus(
      nomNaissance,
      codeNeph,
      'warning',
      EMAIL_NOT_VERIFIED_YET,
      message
    )
  }
}

const prepareInfoCandidatToUpdate = (
  candidat,
  candidatAurige,
  loggerInfoCandidat
) => {
  const {
    candidatExistant,
    dateReussiteETG,
    reussitePratique,
    nbEchecsPratiques,
    dateDernierNonReussite,
    objetDernierNonReussite,
  } = candidatAurige

  const infoCandidatToUpdate = {}

  infoCandidatToUpdate.isValidatedByAurige =
    candidatExistant === CANDIDAT_EXISTANT

  if (!infoCandidatToUpdate.isValidatedByAurige) {
    return infoCandidatToUpdate
  }
  // Date non réussite
  try {
    const dateLastNonReussite = checkFailureDate(
      candidat,
      dateDernierNonReussite
    )
    if (dateLastNonReussite && dateLastNonReussite.isValid) {
      infoCandidatToUpdate.lastNoReussite = {
        date: dateLastNonReussite,
        reason: objetDernierNonReussite,
      }
    }
  } catch (error) {
    const { departement, email } = candidat
    const message = `Pour le ${departement}, la date derniere non-réussite (${dateDernierNonReussite}) est erronée dans le fichier Aurige pour ce candidat ${email} `
    appLogger.warn({
      ...loggerInfoCandidat,
      description: message,
      error,
    })
    error.messageToUser = message
    error.codeMessage = 'NO_REUSSITE_DATE_INVALID'
    throw error
  }

  // Date Reussite Pratique
  if (reussitePratique) {
    const dateReussitePratique = getFrenchLuxonFromISO(reussitePratique)
    if (dateReussitePratique && dateReussitePratique.isValid) {
      infoCandidatToUpdate.reussitePratique = dateReussitePratique
    } else {
      const { departement, email } = candidat
      const message = `Pour le ${departement}, la date de réussite pratique ${reussitePratique} est erronée dans le fichier Aurige pour ce candidat ${email}`
      appLogger.warn({
        ...loggerInfoCandidat,
        description: message,
      })

      const errorAurige = new Error('Invalid Date')
      errorAurige.messageToUser = message
      errorAurige.codeMessage = 'REUSSITE_DATE_INVALID'
      throw errorAurige
    }
  }

  // Nb echec
  const nbFailed = Number(nbEchecsPratiques)
  if (nbFailed) {
    infoCandidatToUpdate.nbEchecsPratiques = nbFailed
  }

  // Date ETG
  const dateTimeDateReussiteETG = getFrenchLuxonFromISO(dateReussiteETG)
  infoCandidatToUpdate.dateReussiteETG = dateTimeDateReussiteETG
  return infoCandidatToUpdate
}

const checkAndArchiveCandidat = async (
  candidat,
  candidatAurige,
  infoCandidatToUpdate,
  loggerInfoCandidat
) => {
  const { candidatExistant, codeNeph, nomNaissance } = candidatAurige
  const { email, departement } = candidat

  let aurigeFeedback
  let dateFeedBack
  let message
  if (candidatExistant === CANDIDAT_NOK) {
    message = `Pour le ${departement}, ce candidat ${codeNeph}/${nomNaissance} sera archivé : NEPH inconnu`
    appLogger.warn({ ...loggerInfoCandidat, description: message })
    aurigeFeedback = CANDIDAT_NOK
  } else if (candidatExistant === CANDIDAT_NOK_NOM) {
    message = `Pour le ${departement}, ce candidat ${codeNeph}/${nomNaissance} sera archivé : Nom inconnu`
    appLogger.warn({ ...loggerInfoCandidat, description: message })
    aurigeFeedback = CANDIDAT_NOK_NOM
  } else if (!infoCandidatToUpdate.isValidatedByAurige) {
    message = `Pour le ${departement}, ce candidat ${email} n'a pas été traité. Cas inconnu`
    appLogger.warn({ ...loggerInfoCandidat, description: message })
    return getCandidatStatus(
      nomNaissance,
      codeNeph,
      'error',
      'UNKNOW_CASE',
      message
    )
  } else if (!infoCandidatToUpdate.dateReussiteETG.isValid) {
    message = `Pour le ${departement}, ce candidat ${email} sera archivé : Date ETG est invalide`
    appLogger.warn({ ...loggerInfoCandidat, description: message })
    infoCandidatToUpdate.dateReussiteETG = undefined
    dateFeedBack = getFrenchLuxon()
    aurigeFeedback = EPREUVE_ETG_KO
  } else if (isETGExpired(infoCandidatToUpdate.dateReussiteETG)) {
    message = `Pour le ${departement}, ce candidat ${email} sera archivé : Date ETG KO`
    appLogger.warn({ ...loggerInfoCandidat, description: message })
    dateFeedBack = getFrenchLuxon()
    aurigeFeedback = EPREUVE_ETG_KO
  } else if (isTooManyFailure(infoCandidatToUpdate.nbEchecsPratiques)) {
    message = `Pour le ${departement}, ce candidat ${email} sera archivé : A 5 échecs pratiques`
    appLogger.warn({ ...loggerInfoCandidat, description: message })

    dateFeedBack =
      infoCandidatToUpdate.lastNoReussite &&
      infoCandidatToUpdate.lastNoReussite.date
    aurigeFeedback = NB_FAILURES_KO
  } else if (infoCandidatToUpdate.reussitePratique) {
    message = `Pour le ${departement}, ce candidat ${email} sera archivé : PRATIQUE OK`
    appLogger.warn({ ...loggerInfoCandidat, description: message })

    dateFeedBack = infoCandidatToUpdate.reussitePratique
    aurigeFeedback = EPREUVE_PRATIQUE_OK
  }

  // Archiver le candidat et envoi de mail
  if (aurigeFeedback) {
    if (dateFeedBack) {
      const place = await findPlaceBookedByCandidat(candidat._id)
      if (place) {
        const datePlace = getFrenchLuxonFromJSDate(place.date)
        candidat = await releaseAndArchivePlace(
          dateFeedBack,
          datePlace,
          aurigeFeedback,
          candidat,
          place
        )
      }
    }

    candidat.set(infoCandidatToUpdate)
    await deleteCandidat(candidat, aurigeFeedback)
    await sendMailToAccount(candidat, aurigeFeedback)
    appLogger.info({
      ...loggerInfoCandidat,
      description: `Envoi de mail ${aurigeFeedback} à ${email}`,
    })

    return getCandidatStatus(
      nomNaissance,
      codeNeph,
      'warning',
      aurigeFeedback,
      message
    )
  }
}

const updateValidCandidat = async (
  candidat,
  infoCandidatToUpdate,
  loggerInfoCandidat
) => {
  const {
    departement,
    email,
    isValidatedByAurige,
    nomNaissance,
    codeNeph,
  } = candidat
  const { lastNoReussite } = infoCandidatToUpdate

  // Vérifier et affecter la pénalité de non-réussite
  const dateTimeEchec = lastNoReussite && lastNoReussite.date
  if (dateTimeEchec) {
    const canBookFrom = getCandBookFrom(candidat, dateTimeEchec)
    if (canBookFrom) {
      infoCandidatToUpdate.canBookFrom = canBookFrom.toISO()
      await cancelBookingAfterExamFailure(candidat, canBookFrom, dateTimeEchec)
    }
  }

  let codeErrMessage
  try {
    // mise à jours du candidat
    candidat.set(infoCandidatToUpdate)
    await candidat.save()
    // Candidat déjà validé
    if (isValidatedByAurige) {
      const message = `Pour le ${departement}, ce candidat ${email} a été mis à jour`
      appLogger.info({ ...loggerInfoCandidat, description: message })
      return getCandidatStatus(
        nomNaissance,
        codeNeph,
        'success',
        OK_UPDATED,
        message
      )
    }

    // candidat validé
    codeErrMessage = OK_MAIL_PB
    appLogger.info({
      ...loggerInfoCandidat,
      description: `Pour le ${departement}, ce candidat ${email} a été validé`,
    })
    const token = createToken(candidat.id, config.userStatuses.CANDIDAT)
    await sendMagicLink(candidat, token)
    const message = `Pour le ${departement}, un magic link est envoyé à ${email}`
    appLogger.info({ ...loggerInfoCandidat, description: message })

    return getCandidatStatus(nomNaissance, codeNeph, 'success', OK, message)
  } catch (err) {
    if (codeErrMessage) {
      err.codeMessage = codeErrMessage
      err.messageToUser = `Pour le ${departement}, Impossible d'envoyer un magic link par un mail à ce candidat ${email}, il a été validé, cependant`
      err.level = 'warning'
      appLogger.warn({
        ...loggerInfoCandidat,
        description: err.messageToUser,
        error: err,
      })
      throw err
    }
    err.messageToUser = `Oups, pour le ${departement}, une erreur est survenue pour le candidat ${email}. L'administrateur a été prévenu.`
    appLogger.error({
      ...loggerInfoCandidat,
      description: `Pour le ${departement}, Erreur de mise à jour pour ce candidat ${email}`,
      error: err,
    })

    err.codeMessage = 'UNKNOW_ERROR'
    throw err
  }
}

export const synchroAurige = async buffer => {
  const loggerInfo = {
    func: 'synchroAurige',
  }

  const retourAurige = JSON.parse(buffer.toString())

  const result = retourAurige.map(async candidatAurige => {
    const loggerInfoCandidat = {
      ...loggerInfo,
      candidatAurige,
    }
    const { codeNeph } = candidatAurige

    let nomNaissance = candidatAurige.nomNaissance

    if (!nomNaissance) {
      const message = `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}: Pas de nom de naissance dans le fichier Aurige`
      appLogger.warn({ ...loggerInfoCandidat, description: message })
      return getCandidatStatus(
        nomNaissance,
        codeNeph,
        'error',
        NO_NAME,
        message
      )
    }

    nomNaissance = latinize(nomNaissance).toUpperCase()

    try {
      const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

      // Vérifier la validité de l'e-mail
      const resultCheck = await checkCandidatFound(candidat, loggerInfoCandidat)
      if (resultCheck) {
        return resultCheck
      }

      // Préparer les valeurs pour la mise à jour du candidat
      const infoCandidatToUpdate = prepareInfoCandidatToUpdate(
        candidat,
        candidatAurige,
        loggerInfoCandidat
      )

      // Vérifier l'état du candidat provenant d'aurige et archive si le faut
      const resultArchive = await checkAndArchiveCandidat(
        candidat,
        candidatAurige,
        infoCandidatToUpdate,
        loggerInfoCandidat
      )
      if (resultArchive) {
        appLogger.debug({ ...loggerInfoCandidat, resultArchive })
        return resultArchive
      }
      // Mettre à jour le candidat
      const resultUpdated = await updateValidCandidat(
        candidat,
        infoCandidatToUpdate,
        loggerInfoCandidat
      )
      return resultUpdated
    } catch (error) {
      if (error.codeMessage) {
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          error.level || 'error',
          error.codeMessage,
          error.messageToUser
        )
      }
      const description = `Erreur inconnue dans traitement de ce candidat ${codeNeph}/${nomNaissance}`
      const message = `Oups, une erreur est survenue pour le candidat ${codeNeph}/${nomNaissance}. L'administrateur a été prévenu.`
      appLogger.error({ ...loggerInfoCandidat, description, error })
      return getCandidatStatus(
        nomNaissance,
        codeNeph,
        'error',
        'UNKNOW_ERROR',
        message
      )
    }
  })

  return Promise.all(result)
}

const releaseAndArchivePlace = async (
  dateAurige,
  datePlace,
  reason,
  candidat,
  place
) => {
  const isCandilib = dateAurige.hasSame(datePlace, 'day')
  const newReason = reason + (isCandilib ? '' : NO_CANDILIB)
  const updatedCandiat = addPlaceToArchive(
    candidat,
    place,
    newReason,
    'AURIGE',
    isCandilib
  )
  await removeBookedPlace(place)
  return updatedCandiat
}

function checkFailureDate (candidat, dateDernierEchecPratique) {
  if (!dateDernierEchecPratique || dateDernierEchecPratique.length === 0) {
    return
  }
  const dateTimeEchec = getFrenchLuxonFromISO(dateDernierEchecPratique)
  if (!dateTimeEchec.isValid) {
    throw new Error('La date de dernier échec pratique est erronée')
  }

  if (candidat && candidat.lastNoReussite && candidat.lastNoReussite.date) {
    const dateLastNoReussite = getFrenchLuxonFromJSDate(
      candidat.lastNoReussite.date
    )
    if (dateTimeEchec.diff(dateLastNoReussite).toObject().milliseconds <= 0) {
      return
    }
  }
  return dateTimeEchec
}

/**
 * @function
 *
 * @param {Candidat} candidat { _id } Candidat à l'examen
 * @param {DateTime} canBookFrom DateTime de luxon
 * @param {DateTime} dateEchec DateTime de luxon
 *
 * @returns {Promise<Candidat>}
 */
const cancelBookingAfterExamFailure = async (
  candidat,
  canBookFrom,
  dateEchec
) => {
  const { _id } = candidat
  const place = await findPlaceBookedByCandidat(_id)
  if (!place) return candidat

  const { date } = place
  // check date
  const dateTimeResa = getFrenchLuxonFromJSDate(date)
  const diffDateResaAndCanBook = dateTimeResa.diff(canBookFrom, 'days')
  const diffDateResaAndNow = dateTimeResa.diffNow('days')

  if (diffDateResaAndCanBook.days > 0) return candidat

  const updatedCandidat = await releaseAndArchivePlace(
    dateEchec,
    dateTimeResa,
    REASON_EXAM_FAILED,
    candidat,
    place
  )

  if (diffDateResaAndNow.days > 0) {
    try {
      await sendFailureExam(place, updatedCandidat)
    } catch (error) {
      appLogger.error({
        func: 'cancelBookingAfterExamFailure',
        description: `Impossible d'envoyer un mail à ce candidat ${updatedCandidat.email} pour lui informer que sa réservation est annulée suite à l'échec de l'examen pratique`,
        error,
      })
    }
  }
  return updatedCandidat
}

export const updateCandidatLastNoReussite = (
  candidat,
  lastDateNoReussiteIso,
  lastReasonNoReussite
) => {
  const { noReussites } = candidat

  if (!noReussites || noReussites.length === 0) {
    return
  }
  const lastDateTimeNoReussite = getFrenchLuxonFromISO(lastDateNoReussiteIso)

  const newNoReussites = noReussites.reduce(
    (cumul, current, index, initArray) => {
      if (index === 1) {
        cumul = [cumul]
      }
      const { date: prevDate, reason: prevReason } = cumul[cumul.length - 1]

      let { date, reason } = current

      if (lastReasonNoReussite && index === initArray.length - 1) {
        const dateTime = getFrenchLuxonFromJSDate(date)
        if (dateTime.equals(lastDateTimeNoReussite)) {
          reason = lastReasonNoReussite
          current.reason = lastReasonNoReussite
        }
      }

      if (prevDate.getTime() === date.getTime() && prevReason !== reason) {
        cumul[cumul.length - 1].reason = reason
      }
      if (prevDate.getTime() !== date.getTime()) {
        cumul.push(current)
      }
      return cumul
    }
  )

  candidat.noReussites = newNoReussites
}
