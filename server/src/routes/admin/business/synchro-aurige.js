import latinize from 'latinize'

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
  getFrenchLuxonDateTimeFromISO,
  getFrenchLuxonDateTimeFromJSDate,
} from '../../../util'
import {
  sendMailToAccount,
  sendMagicLink,
  sendFailureExam,
} from '../../business'

import {
  findCandidatByNomNeph,
  deleteCandidat,
  addPlaceToArchive,
} from '../../../models/candidat'
import { getCandBookFrom } from '../../candidat/places.business'
import {
  findPlaceBookedByCandidat,
  removeBookedPlace,
} from '../../../models/place'
import { REASON_EXAM_FAILED } from '../../common/reason.constants'
import { releaseResa } from '../places.business'

const getCandidatStatus = (nom, neph, status, details, message) => ({
  nom,
  neph,
  status,
  details,
  message,
})

export const isEpreuveEtgInvalid = dateReussiteETG =>
  !dateReussiteETG || !!getFrenchLuxonDateTimeFromISO(dateReussiteETG).invalid

export const isETGExpired = dateReussiteETG => {
  let datetime
  if (dateReussiteETG instanceof Date) {
    datetime = getFrenchLuxonDateTimeFromJSDate(dateReussiteETG)
  } else {
    datetime = getFrenchLuxonDateTimeFromISO(dateReussiteETG)
  }
  return datetime.diffNow('years').years < -5
}

export const isMoreThan2HoursAgo = date =>
  getFrenchLuxonDateTimeFromJSDate(date).diffNow('hours').hours < -2

const isReussitePratique = reussitePratique => {
  return (
    reussitePratique === EPREUVE_PRATIQUE_OK ||
    getFrenchLuxonDateTimeFromISO(reussitePratique).isValid
  )
}

export const synchroAurige = async buffer => {
  const retourAurige = JSON.parse(buffer.toString())

  const result = retourAurige.map(async candidatAurige => {
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

    let nomNaissance = candidatAurige.nomNaissance
    if (!nomNaissance) {
      const message = `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}: Pas de nom de naissance dans le fichier Aurige`
      appLogger.warn(message)
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

      if (candidat === undefined || candidat === null) {
        const message = `Candidat ${codeNeph}/${nomNaissance} non trouvé`
        appLogger.warn(message)
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
          appLogger.warn(message)
          return getCandidatStatus(
            nomNaissance,
            codeNeph,
            'error',
            EMAIL_NOT_VERIFIED_EXPIRED,
            message
          )
        }
        const message = `Candidat ${codeNeph}/${nomNaissance} email non vérifié, inscrit depuis moins de 2h`

        appLogger.warn(message)
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
      if (candidatExistant === CANDIDAT_NOK) {
        message = `Ce candidat ${email} sera archivé : NEPH inconnu`
        appLogger.warn(message)
        aurigeFeedback = CANDIDAT_NOK
      } else if (candidatExistant === CANDIDAT_NOK_NOM) {
        message = `Ce candidat ${email} sera archivé : Nom inconnu`
        appLogger.warn(message)
        aurigeFeedback = CANDIDAT_NOK_NOM
      } else if (isEpreuveEtgInvalid(dateReussiteETG)) {
        message = `Ce candidat ${email} sera archivé : dateReussiteETG invalide`
        appLogger.warn(message)
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isETGExpired(dateReussiteETG)) {
        message = `Ce candidat ${email} sera archivé : Date ETG KO`
        appLogger.warn(message)
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isReussitePratique(reussitePratique)) {
        message = `Ce candidat ${email} sera archivé : PRATIQUE OK`
        appLogger.warn(message)
        aurigeFeedback = EPREUVE_PRATIQUE_OK
        const dateTimeReussitePratique = getFrenchLuxonDateTimeFromISO(
          reussitePratique
        )
        if (dateTimeReussitePratique.isValid) {
          candidat.reussitePratique = dateTimeReussitePratique
        } else {
          appLogger.warn(
            `Ce candidat ${email} sera archivé : reussitePratique n'est pas une date`
          )
        }
        await releaseResa(candidat)
      }

      if (aurigeFeedback) {
        await deleteCandidat(candidat, aurigeFeedback)
        await sendMailToAccount(candidat, aurigeFeedback)
        appLogger.info(`Envoi de mail ${aurigeFeedback} à ${email}`)
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

        const dateTimeDateReussiteETG = getFrenchLuxonDateTimeFromISO(
          dateReussiteETG
        )
        if (dateTimeDateReussiteETG.isValid) {
          updateCandidat.dateReussiteETG = dateTimeDateReussiteETG
        }
        const dateTimeDateDernierEchecPratique = getFrenchLuxonDateTimeFromISO(
          dateDernierEchecPratique
        )
        if (dateTimeDateDernierEchecPratique.isValid) {
          updateCandidat.dateDernierEchecPratique = dateTimeDateDernierEchecPratique
        }

        const dateTimeReussitePratique = getFrenchLuxonDateTimeFromISO(
          reussitePratique
        )
        if (dateTimeReussitePratique.isValid) {
          updateCandidat.reussitePratique = dateTimeReussitePratique
        }

        if (dateDernierNonReussite || objetDernierNonReussite) {
          const dateTimeDateDernierNonReussite = getFrenchLuxonDateTimeFromISO(
            dateDernierNonReussite
          )
          const lastNoReussite = {
            reason: objetDernierNonReussite,
          }
          if (dateTimeDateDernierNonReussite.isValid) {
            lastNoReussite.date = dateTimeDateDernierNonReussite
          }
          updateCandidat.lastNoReussite = lastNoReussite
        }

        const nbFailed = Number(nbEchecsPratiques)
        if (nbFailed) {
          updateCandidat.nbEchecsPratiques = nbFailed
        }
        const dateNoReussite =
          dateDernierEchecPratique || dateDernierNonReussite
        // Check failure date
        const dateTimeEchec = checkFialureDate(dateNoReussite)
        // put a penalty
        if (dateTimeEchec) {
          const canBookFrom = getCandBookFrom(candidat, dateTimeEchec)
          if (canBookFrom) {
            updateCandidat.canBookFrom = canBookFrom.toISO()
            await removeResaNoAuthorize(candidat, canBookFrom)
          }
        }

        // update data candidat
        candidat.set(updateCandidat)
        return candidat
          .save()
          .then(async candidat => {
            if (isValidatedByAurige) {
              const message = `Ce candidat ${candidat.email} a été mis à jour`
              appLogger.info(message)
              return getCandidatStatus(
                nomNaissance,
                codeNeph,
                'success',
                OK_UPDATED,
                message
              )
            } else {
              let message = `Ce candidat ${candidat.email} a été validé`
              appLogger.info(message)
              const token = createToken(
                candidat.id,
                config.userStatuses.CANDIDAT
              )

              message = `Envoi d'un magic link à ${email}`
              appLogger.info(message)
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
                message = `Impossible d'envoyer un magic link par un mail à ce candidat ${
                  candidat.email
                }, il a été validé, cependant`

                appLogger.info(message)
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
            appLogger.warn(message + ':', err)
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
        appLogger.warn(message)
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
      appLogger.warn(message)
      appLogger.warn(error)
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

function checkFialureDate (dateDernierEchecPratique) {
  if (dateDernierEchecPratique && dateDernierEchecPratique.length > 0) {
    const dateTimeEchec = getFrenchLuxonDateTimeFromISO(
      dateDernierEchecPratique
    )
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
 * @param {*} canBookFrom DateTime de luxon
 */
const removeResaNoAuthorize = async (candidat, canBookFrom) => {
  const { _id } = candidat
  const place = await findPlaceBookedByCandidat(_id)
  if (place) {
    const { date } = place
    // check date
    const dateTimeResa = getFrenchLuxonDateTimeFromJSDate(date)
    const diffDateResaAndCanBook = dateTimeResa.diff(canBookFrom, 'days')
    const diffDateResaAndNow = dateTimeResa.diffNow('days')
    if (diffDateResaAndCanBook.days < 0) {
      addPlaceToArchive(candidat, place, REASON_EXAM_FAILED)
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
