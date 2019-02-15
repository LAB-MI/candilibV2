import latinize from 'latinize'
import { DateTime } from 'luxon'

import config from '../../../config'
import {
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
import { sendMailToAccount, sendMagicLink } from '../../business'

import { findCandidatByNomNeph, deleteCandidat } from '../../../models/candidat'
import logger from '../../../util/logger'

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
      logger.warn(
        `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}: Pas de nom de naissance dans le fichier Aurige`
      )
      return getCandidatStatus(nomNaissance, codeNeph, 'error', NO_NAME)
    }

    nomNaissance = latinize(nomNaissance).toUpperCase()

    try {
      const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

      if (candidat === undefined || candidat === null) {
        logger.warn(`Candidat ${codeNeph}/${nomNaissance} non trouvé`)
        return getCandidatStatus(nomNaissance, codeNeph, 'error', NOT_FOUND)
      }

      if (!candidat.isValidatedEmail) {
        if (isMoreThan2HoursAgo(candidat.presignedUpAt)) {
          logger.warn(
            `Candidat ${codeNeph}/${nomNaissance} email non vérifié depuis plus de 2h`
          )
          return getCandidatStatus(
            nomNaissance,
            codeNeph,
            'error',
            EMAIL_NOT_VERIFIED_EXPIRED
          )
        }
        logger.warn(
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
        logger.warn(`Ce candidat ${email} sera archivé : NEPH inconnu`)
        aurigeFeedback = CANDIDAT_NOK
      } else if (candidatExistant === CANDIDAT_NOK_NOM) {
        logger.warn(`Ce candidat ${email} sera archivé : Nom inconnu`)
        aurigeFeedback = CANDIDAT_NOK_NOM
      } else if (isEpreuveEtgInvalid(dateReussiteETG)) {
        logger.warn(
          `Ce candidat ${email} sera archivé : dateReussiteETG invalide`
        )
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (isETGExpired(dateReussiteETG)) {
        logger.warn(`Ce candidat ${email} sera archivé : Date ETG KO`)
        aurigeFeedback = EPREUVE_ETG_KO
      } else if (reussitePratique === EPREUVE_PRATIQUE_OK) {
        logger.warn(`Ce candidat ${email} sera archivé : PRATIQUE OK`)
        aurigeFeedback = EPREUVE_PRATIQUE_OK
      }
      if (aurigeFeedback) {
        await deleteCandidat(candidat, aurigeFeedback)
        await sendMailToAccount(candidat, aurigeFeedback)
        logger.info(`Envoi de mail ${aurigeFeedback} à ${email}`)
        return getCandidatStatus(
          nomNaissance,
          codeNeph,
          'error',
          aurigeFeedback
        )
      }

      if (candidatExistant === CANDIDAT_EXISTANT) {
        const { isValidatedByAurige } = candidat

        candidat.set({
          dateReussiteETG,
          dateDernierEchecPratique,
          reussitePratique,
          isValidatedByAurige: true,
        })
        return candidat
          .save()
          .then(async candidat => {
            if (isValidatedByAurige) {
              logger.info(`Ce candidat ${candidat.email} a été mis à jour`)
              return getCandidatStatus(
                nomNaissance,
                codeNeph,
                'success',
                OK_UPDATED
              )
            } else {
              logger.info(`Ce candidat ${candidat.email} a été validé`)
              const token = createToken(
                candidat.id,
                config.USER_STATUS_LEVEL.candidat
              )

              logger.info(`Envoi d'un magic link à ${email}`)
              try {
                await sendMagicLink(candidat, token)
                return getCandidatStatus(nomNaissance, codeNeph, 'success', OK)
              } catch (error) {
                logger.info(
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
            logger.warn(`Erreur de mise à jour pour ce candidat ${email}:`, err)
            return getCandidatStatus(nomNaissance, codeNeph, 'error')
          })
      } else {
        logger.warn(`Ce candidat ${email} n'a pas été traité. Cas inconnu`)
        return getCandidatStatus(nomNaissance, codeNeph, 'error', 'UNKNOW_CASE')
      }
    } catch (error) {
      logger.warn(
        `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}`
      )
      logger.warn(error)
      return getCandidatStatus(nomNaissance, codeNeph, 'error', 'UNKNOW_ERROR')
    }
  })

  return Promise.all(result)
}
