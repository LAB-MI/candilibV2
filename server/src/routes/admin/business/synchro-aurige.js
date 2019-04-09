import latinize from 'latinize'
import { DateTime } from 'luxon'

import config from '../../../config'
import {
  appLogger,
  CANDIDAT_EXISTANT,
  EPREUVE_PRATIQUE_OK,
  EPREUVE_ETG_KO,
  CANDIDAT_NOK,
  CANDIDAT_NOK_NOM,
  EMAIL_NOT_VERIFIED_EXPIRED,
  EMAIL_NOT_VERIFIED_YET,
  NO_NAME,
  NOT_FOUND,
  OK,
  OK_MAIL_PB,
  OK_UPDATED,
  createToken,
} from '../../../util'
import {
  sendMailToAccount,
  sendMagicLink,
  sendFailureExam,
} from '../../business'

import {
  findCandidatByNomNeph,
  deleteCandidat,
  buildAddArchivePlace,
} from '../../../models/candidat'
import { getCandBookAfter } from '../../candidat/places.business'
import {
  findPlaceBookedByCandidat,
  removeBookedPlace,
} from '../../../models/place'
import { REASON_EXAM_FAILED } from '../../common/reason.constants'

const getCandidatStatus = (nom, neph, status, details) => ({
  nom,
  neph,
  status,
  details,
})

export const isEpreuveEtgInvalid = dateReussiteETG =>
  !dateReussiteETG || !!DateTime.fromISO(dateReussiteETG).invalid

export const isETGExpired = dateReussiteETG =>
  DateTime.fromJSDate(dateReussiteETG).diffNow('years').years < -5

export const isMoreThan2HoursAgo = date =>
  DateTime.fromJSDate(date).diffNow('hours').hours < -2

export const synchroAurige = async buffer => {
  const retourAurige = JSON.parse(buffer.toString())

  const result = retourAurige.map(async candidatAurige => {
    const {
      codeNeph,
      candidatExistant,
      dateReussiteETG,
      reussitePratique,
      dateDernierEchecPratique,
    } = candidatAurige

    let nomNaissance = candidatAurige.nomNaissance
    if (!nomNaissance) {
      appLogger.warn(
        `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}: Pas de nom de naissance dans le fichier Aurige`
      )
      return getCandidatStatus(nomNaissance, codeNeph, 'error', NO_NAME)
    }

    nomNaissance = latinize(nomNaissance).toUpperCase()

    try {
      const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

      if (candidat === undefined || candidat === null) {
        appLogger.warn(`Candidat ${codeNeph}/${nomNaissance} non trouvé`)
        return getCandidatStatus(nomNaissance, codeNeph, 'error', NOT_FOUND)
      }

      if (!candidat.isValidatedEmail) {
        if (isMoreThan2HoursAgo(candidat.presignedUpAt)) {
          appLogger.warn(
            `Candidat ${codeNeph}/${nomNaissance} email non vérifié depuis plus de 2h`
          )
          return getCandidatStatus(
            nomNaissance,
            codeNeph,
            'error',
            EMAIL_NOT_VERIFIED_EXPIRED
          )
        }
        appLogger.warn(
          `Candidat ${codeNeph}/${nomNaissance} email non vérifié, inscrit depuis moins de 2h`
        )
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          'warning',
          EMAIL_NOT_VERIFIED_YET
        )
      }

      const { email } = candidat

      let aurigeFeedback

      if (candidatExistant === CANDIDAT_NOK) {
        appLogger.warn(`Ce candidat ${email} sera archivé : NEPH inconnu`)
        aurigeFeedback = CANDIDAT_NOK
      } else if (candidatExistant === CANDIDAT_NOK_NOM) {
        appLogger.warn(`Ce candidat ${email} sera archivé : Nom inconnu`)
        aurigeFeedback = CANDIDAT_NOK_NOM
      } else if (isEpreuveEtgInvalid(dateReussiteETG)) {
        appLogger.warn(
          `Ce candidat ${email} sera archivé : dateReussiteETG invalide`
        )
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isETGExpired(dateReussiteETG)) {
        appLogger.warn(`Ce candidat ${email} sera archivé : Date ETG KO`)
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (reussitePratique === EPREUVE_PRATIQUE_OK) {
        appLogger.warn(`Ce candidat ${email} sera archivé : PRATIQUE OK`)
        aurigeFeedback = EPREUVE_PRATIQUE_OK
      }
      if (aurigeFeedback) {
        await deleteCandidat(candidat, aurigeFeedback)
        await sendMailToAccount(candidat, aurigeFeedback)
        appLogger.info(`Envoi de mail ${aurigeFeedback} à ${email}`)
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          'error',
          aurigeFeedback
        )
      }

      if (candidatExistant === CANDIDAT_EXISTANT) {
        const { isValidatedByAurige } = candidat
        const updateCandidat = {
          dateReussiteETG,
          dateDernierEchecPratique,
          reussitePratique,
          isValidatedByAurige: true,
        }

        // Check failure date
        const dateTimeEchec = checkFialureDate(dateDernierEchecPratique)
        // put a penalty
        if (dateTimeEchec) {
          const canBookAfter = getCandBookAfter(candidat, dateTimeEchec)
          if (canBookAfter) {
            updateCandidat.canBookAfter = canBookAfter
          }

          await removeResaNoAuthorize(candidat, canBookAfter)
        }

        // update data candidat
        candidat.set(updateCandidat)
        return candidat
          .save()
          .then(async candidat => {
            if (isValidatedByAurige) {
              appLogger.info(`Ce candidat ${candidat.email} a été mis à jour`)
              return getCandidatStatus(
                nomNaissance,
                codeNeph,
                'success',
                OK_UPDATED
              )
            } else {
              appLogger.info(`Ce candidat ${candidat.email} a été validé`)
              const token = createToken(
                candidat.id,
                config.userStatuses.CANDIDAT
              )

              appLogger.info(`Envoi d'un magic link à ${email}`)
              try {
                await sendMagicLink(candidat, token)
                return getCandidatStatus(nomNaissance, codeNeph, 'success', OK)
              } catch (error) {
                appLogger.info(
                  `Impossible d'envoyer un mail à ce candidat ${
                    candidat.email
                  }, il a été validé, cependant`
                )
                return getCandidatStatus(
                  nomNaissance,
                  codeNeph,
                  'warning',
                  OK_MAIL_PB
                )
              }
            }
          })
          .catch(err => {
            appLogger.warn(
              `Erreur de mise à jour pour ce candidat ${email}:`,
              err
            )
            return getCandidatStatus(nomNaissance, codeNeph, 'error')
          })
      } else {
        appLogger.warn(`Ce candidat ${email} n'a pas été traité. Cas inconnu`)
        return getCandidatStatus(nomNaissance, codeNeph, 'error', 'UNKNOW_CASE')
      }
    } catch (error) {
      appLogger.warn(
        `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}`
      )
      appLogger.warn(error)
      return getCandidatStatus(nomNaissance, codeNeph, 'error', 'UNKNOW_ERROR')
    }
  })

  return Promise.all(result)
}

function checkFialureDate (dateDernierEchecPratique) {
  if (dateDernierEchecPratique && dateDernierEchecPratique.length > 0) {
    const dateTimeEchec = DateTime.fromISO(dateDernierEchecPratique)
    if (!dateTimeEchec.isValid) {
      appLogger.warn('La date de denier echec pratique est érroné')
    } else {
      return dateTimeEchec
    }
  }
}

/**
 *
 * @param {*} param0 { _id } Id du candidat
 * @param {*} canBookAfter DateTime de luxon
 */
const removeResaNoAuthorize = async (candidat, canBookAfter) => {
  const { _id } = candidat
  const place = await findPlaceBookedByCandidat(_id)
  if (place) {
    const { date } = place
    // check date
    const dateTimeResa = DateTime.fromJSDate(date)
    const diffDateResaAndCanBook = dateTimeResa.diff(canBookAfter, 'days')
    const diffDateResaAndNow = dateTimeResa.diffNow('days')
    if (diffDateResaAndCanBook.days < 0) {
      buildAddArchivePlace(candidat, place, REASON_EXAM_FAILED)
      await removeBookedPlace(place)

      if (diffDateResaAndNow.days > 0) {
        try {
          await sendFailureExam(place, candidat)
        } catch (error) {
          appLogger.warn(
            `Impossible d'envoyer un mail à ce candidat ${
              candidat.email
            } pour lui informer que sa réservation est annulée suit à l'echec examen pratique`
          )
          appLogger.error(error.message)
        }
      }
    }
  }
}
