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
      candidatAurige,
    }
    const {
      codeNeph,
      candidatExistant,
      dateReussiteETG,
      reussitePratique,
      dateDernierEchecPratique,
      nbEchecsPratiques,
      dateDernierNonReussite,
      objetDernierNonReussite,
    } = candidatAurige
    appLogger.debug({
      func: 'synchroAurige',
      codeNeph,
      candidatExistant,
      dateReussiteETG,
      reussitePratique,
      dateDernierEchecPratique,
      nbEchecsPratiques,
      dateDernierNonReussite,
      objetDernierNonReussite,
    })
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

      if (candidat === undefined || candidat === null) {
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

      if (!candidat.isValidatedEmail) {
        if (isMoreThan2HoursAgo(candidat.presignedUpAt)) {
          const message = `Candidat ${codeNeph}/${nomNaissance} email non vérifié depuis plus de 2h`
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
        const message = `Candidat ${codeNeph}/${nomNaissance} email non vérifié, inscrit depuis moins de 2h`

        appLogger.warn({ ...loggerInfoCandidat, description: message })
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          'warning',
          EMAIL_NOT_VERIFIED_YET,
          message
        )
      }

      const { email } = candidat

      let aurigeFeedback
      let message
      let dateFeedBack
      if (candidatExistant === CANDIDAT_NOK) {
        message = `Ce candidat ${email} sera archivé : NEPH inconnu`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = CANDIDAT_NOK
      } else if (candidatExistant === CANDIDAT_NOK_NOM) {
        message = `Ce candidat ${email} sera archivé : Nom inconnu`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = CANDIDAT_NOK_NOM
      } else if (isEpreuveEtgInvalid(dateReussiteETG)) {
        message = `Ce candidat ${email} sera archivé : dateReussiteETG invalide`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isETGExpired(dateReussiteETG)) {
        message = `Ce candidat ${email} sera archivé : Date ETG KO`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isTooManyFailure(Number(nbEchecsPratiques))) {
        message = `Ce candidat ${email} sera archivé : A 5 échecs pratiques`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = NB_FAILURES_KO
        try {
          dateFeedBack = checkFailureDate(candidat, dateDernierNonReussite)
          if (dateFeedBack && dateFeedBack.isValid) {
            candidat.lastNoReussite = {
              date: dateFeedBack,
              reason: objetDernierNonReussite,
            }
          }
        } catch (error) {
          appLogger.warn({
            ...loggerInfoCandidat,
            description: error.message,
            error,
          })
        }
      } else if (isReussitePratique(reussitePratique)) {
        message = `Ce candidat ${email} sera archivé : PRATIQUE OK`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        aurigeFeedback = EPREUVE_PRATIQUE_OK
        dateFeedBack = getFrenchLuxonFromISO(reussitePratique)
        if (dateFeedBack.isValid) {
          candidat.reussitePratique = dateFeedBack
        } else {
          appLogger.warn({
            ...loggerInfoCandidat,
            description: `Ce candidat ${email} sera archivé : reussitePratique n'est pas une date`,
          })
        }
      }

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

      if (candidatExistant === CANDIDAT_EXISTANT) {
        const { isValidatedByAurige } = candidat
        const updateCandidat = {
          isValidatedByAurige: true,
        }
        // Date ETG
        const dateTimeDateReussiteETG = getFrenchLuxonFromISO(dateReussiteETG)
        if (dateTimeDateReussiteETG.isValid) {
          updateCandidat.dateReussiteETG = dateTimeDateReussiteETG
        }
        // Date reussite Pratique
        const dateTimeReussitePratique = getFrenchLuxonFromISO(reussitePratique)
        if (dateTimeReussitePratique.isValid) {
          updateCandidat.reussitePratique = dateTimeReussitePratique
        }

        // Nb echec
        const nbFailed = Number(nbEchecsPratiques)
        if (nbFailed) {
          updateCandidat.nbEchecsPratiques = nbFailed
        }

        // Date non réussite
        const dateNoReussite =
          dateDernierEchecPratique || dateDernierNonReussite

        // TODO: A retirer, Correction pour le passage V1 à V2
        updateCandidatLastNoReussite(
          candidat,
          dateNoReussite,
          objetDernierNonReussite
        )

        // Check failure date
        const dateTimeEchec = checkFailureDate(candidat, dateNoReussite)
        // put a penalty And last no reussite
        if (dateTimeEchec) {
          updateCandidat.lastNoReussite = {
            date: dateTimeEchec,
            reason: dateDernierEchecPratique ? '' : objetDernierNonReussite,
          }

          const canBookFrom = getCandBookFrom(candidat, dateTimeEchec)
          if (canBookFrom) {
            updateCandidat.canBookFrom = canBookFrom.toISO()
            await removeResaNoAuthorize(candidat, canBookFrom, dateTimeEchec)
          }
        }

        appLogger.debug({ ...loggerInfoCandidat, updateCandidat })
        // update data candidat
        candidat.set(updateCandidat)

        return candidat
          .save()
          .then(async candidat => {
            if (isValidatedByAurige) {
              const message = `Ce candidat ${candidat.email} a été mis à jour`
              appLogger.info({ ...loggerInfoCandidat, description: message })
              return getCandidatStatus(
                nomNaissance,
                codeNeph,
                'success',
                OK_UPDATED,
                message
              )
            } else {
              let message = `Ce candidat ${candidat.email} a été validé`
              appLogger.info({ ...loggerInfoCandidat, description: message })
              const token = createToken(
                candidat.id,
                config.userStatuses.CANDIDAT
              )

              message = `Envoi d'un magic link à ${email}`
              appLogger.info({ ...loggerInfoCandidat, description: message })
              try {
                await sendMagicLink(candidat, token)
                return getCandidatStatus(
                  nomNaissance,
                  codeNeph,
                  'success',
                  OK,
                  message
                )
              } catch (error) {
                message = `Impossible d'envoyer un magic link par un mail à ce candidat ${candidat.email}, il a été validé, cependant`

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
            }
          })
          .catch(err => {
            const message = `Erreur de mise à jour pour ce candidat ${email}`
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
          })
      } else {
        const message = `Ce candidat ${email} n'a pas été traité. Cas inconnu`
        appLogger.warn({ ...loggerInfoCandidat, description: message })
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          'error',
          'UNKNOW_CASE',
          message
        )
      }
    } catch (error) {
      const message = `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}`
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
  dateAurgie,
  datePlace,
  reason,
  candidat,
  place
) => {
  const isCandilib = dateAurgie.hasSame(datePlace, 'day')
  const newReason = reason + (isCandilib ? '' : NO_CANDILIB)
  const updatedCandiat = addPlaceToArchive(
    candidat,
    place,
    newReason,
    undefined,
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
        description: `Impossible d'envoyer un mail à ce candidat ${updatedCandidat.email} pour lui informer que sa réservation est annulée suit à l'echec examen pratique`,
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
