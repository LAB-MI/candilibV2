import latinize from 'latinize'
import moment from 'moment'

import config from '../../../config'
import {
  CANDIDAT_EXISTANT,
  EPREUVE_PRATIQUE_OK,
  EPREUVE_ETG_KO,
  CANDIDAT_NOK,
  CANDIDAT_NOK_NOM,
  createToken,
} from '../../../util'
import { sendMailToAccount, sendMagicLink } from '../../business'

import { findCandidatByNomNeph, deleteCandidat } from '../../../models/candidat'
import logger from '../../../util/logger'

const getCandidatStatus = (nom, neph, status) => ({ nom, neph, status })

export const epreuveEtgInvalid = ({ dateReussiteETG }) =>
  !dateReussiteETG || !moment(dateReussiteETG).isValid()

const isETGStillValid = dateReussiteETG =>
  moment().diff(dateReussiteETG, 'years', true) <= 5

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
      return getCandidatStatus(nomNaissance, codeNeph, 'error')
    }

    nomNaissance = latinize(nomNaissance).toUpperCase()

    try {
      const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

      if (candidat === undefined || candidat === null) {
        logger.warn(`Candidat ${codeNeph}/${nomNaissance} non trouvé`)
        return getCandidatStatus(nomNaissance, codeNeph, 'error')
      }

      const { email } = candidat

      let aurigeFeedback
      let recipient

      if (candidatExistant === CANDIDAT_NOK) {
        logger.warn(`Ce candidat ${email} sera archivé : NEPH inconnu`)
        aurigeFeedback = CANDIDAT_NOK
        recipient = candidat
      } else if (candidatExistant === CANDIDAT_NOK_NOM) {
        logger.warn(`Ce candidat ${email} sera archivé : Nom inconnu`)
        aurigeFeedback = CANDIDAT_NOK_NOM
        recipient = candidat
      } else if (epreuveEtgInvalid(candidatAurige)) {
        logger.warn(
          `Ce candidat ${email} sera archivé : dateReussiteETG invalide`
        )
        aurigeFeedback = EPREUVE_ETG_KO
        recipient = candidat
      } else if (!isETGStillValid(dateReussiteETG)) {
        logger.warn(`Ce candidat ${email} sera archivé : Date ETG KO`)
        aurigeFeedback = EPREUVE_ETG_KO
        recipient = candidatAurige
      } else if (reussitePratique === EPREUVE_PRATIQUE_OK) {
        logger.warn(`Ce candidat ${email} sera archivé : PRATIQUE OK`)
        aurigeFeedback = EPREUVE_PRATIQUE_OK
        recipient = candidatAurige
      }
      if (aurigeFeedback) {
        await deleteCandidat(candidat, aurigeFeedback)
        await sendMailToAccount(recipient, aurigeFeedback)
        logger.info(`Envoi de mail ${aurigeFeedback} à ${email}`)
        return getCandidatStatus(nomNaissance, codeNeph, 'success')
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
          .then(candidat => {
            if (isValidatedByAurige) {
              logger.info(`Ce candidat ${candidat.email} a été mis à jour`)
              return getCandidatStatus(nomNaissance, codeNeph, 'success')
            } else {
              logger.info(`Ce candidat ${candidat.email} a été validé`)
              const token = createToken(
                candidat.id,
                config.USER_STATUS_LEVEL.candidat
              )

              logger.info(`Envoi d'un magic link à ${email}`)
              sendMagicLink(candidat, token)
              return getCandidatStatus(nomNaissance, codeNeph, 'success')
            }
          })
          .catch(err => {
            logger.warn(
              `Erreur de mise à jours pour ce candidat ${email}:`,
              err
            )
            return getCandidatStatus(nomNaissance, codeNeph, 'error')
          })
      } else {
        logger.warn(`Ce candidat ${email} n'a pas été traité. Cas inconnu`)
        return getCandidatStatus(nomNaissance, codeNeph, 'error')
      }
    } catch (error) {
      logger.warn(
        `Erreur dans la recherche du candidat pour ce candidat ${codeNeph}/${nomNaissance}`
      )
      logger.warn(error)
      return getCandidatStatus(nomNaissance, codeNeph, 'error')
    }
  })

  return Promise.all(result)
}
