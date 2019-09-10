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

export const isEpreuveEtgInvalid = dateReussiteETG =>
  !dateReussiteETG || !!getFrenchLuxonFromISO(dateReussiteETG).invalid

export const isETGExpired = dateReussiteETG => {
  let datetime
  if (dateReussiteETG instanceof Date) {
    datetime = getFrenchLuxonFromJSDate(dateReussiteETG)
  } else {
    datetime = getFrenchLuxonFromISO(dateReussiteETG)
  }
  return datetime.diffNow('years').years < -5
}

export const isMoreThan2HoursAgo = date =>
  getFrenchLuxonFromJSDate(date).diffNow('hours').hours < -2

const isReussitePratique = reussitePratique => {
  return (
    reussitePratique === EPREUVE_PRATIQUE_OK ||
    getFrenchLuxonFromISO(reussitePratique).isValid
  )
}

const isTooManyFailure = nbFailed => {
  return nbFailed === 5
}

export const synchroAurige = async buffer => {
  const loggerInfo = {
    func: 'synchroAurige',
  }

  const retourAurige = JSON.parse(buffer.toString())

  const result = retourAurige.map(async candidatAurige => {
    const loggerInfoCandidat = {
      ...loggerInfo,
      candidatAurige: {
        ...candidatAurige,
        dateDernierNonReussite: candidatAurige.dateDernierNonReussite || null,
        reussitePratique: candidatAurige.reussitePratique || null,
        dateReussiteETG: candidatAurige.dateReussiteETG || null,
      },
    }
    const {
      codeNeph,
      candidatExistant,
      dateReussiteETG,
      reussitePratique,
      nbEchecsPratiques,
      dateDernierNonReussite,
      objetDernierNonReussite,
    } = candidatAurige
    appLogger.debug(loggerInfoCandidat)

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
      let candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

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

      const {
        email,
        departement,
        isValidatedByAurige,
        isValidatedEmail,
      } = candidat

      // Vérifier la validité de l'e-mail
      if (!isValidatedEmail) {
        if (isMoreThan2HoursAgo(candidat.presignedUpAt)) {
          const message = `Pour le ${departement}, Ce candidat ${email} sera archivé : email non vérifié depuis plus de 2h`
          appLogger.warn({ ...loggerInfoCandidat, description: message })
          await deleteCandidat(candidat, 'EMAIL_NOT_VERIFIED_EXPIRED')
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

      // Vérifier l'état du candidat et la validité des valeurs provenant d'aurige
      let aurigeFeedback
      let message
      if (candidatExistant === CANDIDAT_NOK) {
        message = `Pour le ${departement}, ce candidat ${codeNeph}/${nomNaissance} sera archivé : NEPH inconnu`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = CANDIDAT_NOK
      } else if (candidatExistant === CANDIDAT_NOK_NOM) {
        message = `Pour le ${departement}, ce candidat ${codeNeph}/${nomNaissance} sera archivé : Nom inconnu`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = CANDIDAT_NOK_NOM
      } else if (isEpreuveEtgInvalid(dateReussiteETG)) {
        message = `Pour le ${departement}, ce candidat ${email} sera archivé : dateReussiteETG invalide`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isETGExpired(dateReussiteETG)) {
        message = `Pour le ${departement}, ce candidat ${email} sera archivé : Date ETG KO`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isTooManyFailure(Number(nbEchecsPratiques))) {
        message = `Pour le ${departement}, ce candidat ${email} sera archivé : A 5 échecs pratiques`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = NB_FAILURES_KO
      } else if (isReussitePratique(reussitePratique)) {
        message = `Pour le ${departement}, ce candidat ${email} sera archivé : PRATIQUE OK`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = EPREUVE_PRATIQUE_OK
      }

      // Preparer les valeurs pour la mise à jours du candidat
      const infoCandidatToUpdate = {}
      infoCandidatToUpdate.isValidatedByAurige =
        candidatExistant === CANDIDAT_EXISTANT

      if (infoCandidatToUpdate.isValidatedByAurige) {
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
          message = `Pour le ${departement}, la date derniere non-réussite (${dateDernierNonReussite}) est erronée dans le fichier Aurige pour ce candidat ${email} `
          appLogger.warn({
            ...loggerInfoCandidat,
            description: message,
            error,
          })
          return getCandidatStatus(
            nomNaissance,
            codeNeph,
            'error',
            'DATE_INVALID',
            message
          )
        }

        // Date Reussite Pratique
        if (reussitePratique) {
          // TODO: A optimiser, getFrenchLuxonFromISO de cette date est appelée 2 fois
          const dateReussitePratique = getFrenchLuxonFromISO(reussitePratique)
          if (dateReussitePratique && dateReussitePratique.isValid) {
            infoCandidatToUpdate.reussitePratique = dateReussitePratique
          } else {
            message = `Pour le ${departement}, la date de réussite pratique ${reussitePratique} est erronée dans le fichier Aurige pour ce candidat ${email}`
            appLogger.warn({
              ...loggerInfoCandidat,
              description: message,
            })
            return getCandidatStatus(
              nomNaissance,
              codeNeph,
              'error',
              'DATE_INVALID',
              message
            )
          }
        }

        // Nb echec
        const nbFailed = Number(nbEchecsPratiques)
        if (nbFailed) {
          infoCandidatToUpdate.nbEchecsPratiques = nbFailed
        }

        // Date ETG
        if (dateReussiteETG) {
          // TODO: A optimiser, getFrenchLuxonFromISO de cette date est appelée 3 fois
          const dateTimeDateReussiteETG = getFrenchLuxonFromISO(dateReussiteETG)
          if (dateTimeDateReussiteETG.isValid) {
            infoCandidatToUpdate.dateReussiteETG = dateTimeDateReussiteETG
          } else {
            appLogger.warn({
              ...loggerInfoCandidat,
              description: `Pour le ${departement}, Ce candidat ${email} a une date reussite ETG qui n'est pas une date`,
            })
          }
        }
      }

      // Archiver le candidat et envoi de mail
      if (aurigeFeedback) {
        let dateFeedBack
        switch (aurigeFeedback) {
          case EPREUVE_ETG_KO:
            dateFeedBack = getFrenchLuxon()
            break
          case NB_FAILURES_KO:
            dateFeedBack =
              infoCandidatToUpdate.lastNoReussite &&
              infoCandidatToUpdate.lastNoReussite.date
            break
          case EPREUVE_PRATIQUE_OK:
            dateFeedBack = infoCandidatToUpdate.reussitePratique
            break
          default:
            break
        }

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

      // Valeur inconnue provenant d'aurige
      if (!infoCandidatToUpdate.isValidatedByAurige) {
        const message = `Pour le ${departement}, ce candidat ${email} n'a pas été traité. Cas inconnu`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          'error',
          'UNKNOW_CASE',
          message
        )
      }

      // Vérifier et affecter la pénalité de non-réussite
      const dateTimeEchec =
        infoCandidatToUpdate.lastNoReussite &&
        infoCandidatToUpdate.lastNoReussite.date
      if (dateTimeEchec) {
        const canBookFrom = getCandBookFrom(candidat, dateTimeEchec)
        if (canBookFrom) {
          infoCandidatToUpdate.canBookFrom = canBookFrom.toISO()
          await removeResaNoAuthorize(candidat, canBookFrom, dateTimeEchec)
        }
      }

      appLogger.debug({ ...loggerInfoCandidat, infoCandidatToUpdate })
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
        let message = `Pour le ${departement}, ce candidat ${email} a été validé`
        appLogger.info({ ...loggerInfoCandidat, description: message })
        const token = createToken(candidat.id, config.userStatuses.CANDIDAT)

        try {
          await sendMagicLink(candidat, token)
          message = `Pour le ${departement}, un magic link est envoyé à ${email}`
          appLogger.info({ ...loggerInfoCandidat, description: message })
          return getCandidatStatus(
            nomNaissance,
            codeNeph,
            'success',
            OK,
            message
          )
        } catch (error) {
          message = `Pour le ${departement}, Impossible d'envoyer un magic link par un mail à ce candidat ${email}, il a été validé, cependant`

          appLogger.error({
            ...loggerInfoCandidat,
            description: message,
            error,
          })
          return getCandidatStatus(
            nomNaissance,
            codeNeph,
            'warning',
            OK_MAIL_PB,
            message
          )
        }
      } catch (err) {
        const message = `Pour le ${departement}, Erreur de mise à jour pour ce candidat ${email}`
        appLogger.error({
          ...loggerInfoCandidat,
          description: message,
          error: err,
        })
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          'error',
          'UNKNOW_ERROR',
          message
        )
      }
    } catch (error) {
      const message = `Erreur inconnue dans traitement de ce candidat ${codeNeph}/${nomNaissance}`
      appLogger.error({ ...loggerInfoCandidat, description: message, error })
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
    throw new Error('La date de denier échec pratique est erronée')
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
 *
 * @param {*} param0 { _id } Id du candidat
 * @param {*} canBookFrom DateTime de luxon
 */
const removeResaNoAuthorize = async (candidat, canBookFrom, dateEchec) => {
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
        func: 'removeResaNoAuthorize',
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
