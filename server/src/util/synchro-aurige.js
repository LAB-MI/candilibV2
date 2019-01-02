import latinize from 'latinize'
import moment from 'moment'

import config from '../config'
import {
  CANDIDAT_EXISTANT,
  EPREUVE_PRATIQUE_OK,
  EPREUVE_ETG_KO,
  CANDIDAT_NOK,
  CANDIDAT_NOK_NOM,
} from './constants'
import { createToken } from './token'
import { findCandidatByNomNeph, deleteCandidat } from '../models/candidat'
import logger from '../logger'
import { sendMailToAccount, sendMagicLink } from './send-mail'

const getCandidatStatus = (nom, neph, status) => ({ nom, neph, status })

export const epreuveEtgInvalid = candidatAurige =>
  !candidatAurige.dateReussiteETG ||
  !moment(candidatAurige.dateReussiteETG).isValid()

const isETGStillValid = dateReussiteETG =>
  moment().diff(dateReussiteETG, 'years', true) > 5

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

      let mailType
      let recipient

      if (candidatExistant === CANDIDAT_NOK) {
        await deleteCandidat(candidat)
        logger.warn(`Ce candidat ${email} a été detruit: NEPH inconnu`)
        mailType = CANDIDAT_NOK
        recipient = candidat
      }
      if (candidatExistant === CANDIDAT_NOK_NOM) {
        await deleteCandidat(candidat)
        logger.warn(`Ce candidat ${email} a été detruit: Nom inconnu`)
        mailType = CANDIDAT_NOK_NOM
        recipient = candidat
      }
      if (epreuveEtgInvalid(candidatAurige)) {
        await deleteCandidat(candidat)
        logger.warn(
          `Ce candidat ${email} a été detruit: dateReussiteETG invalide`
        )
        mailType = CANDIDAT_NOK_NOM
        recipient = candidat
      }
      if (isETGStillValid(dateReussiteETG)) {
        await deleteCandidat(candidat)
        logger.warn(`Ce candidat ${email} a été detruit: Date ETG KO`)
        mailType = EPREUVE_ETG_KO
        recipient = candidatAurige
      }
      if (reussitePratique === EPREUVE_PRATIQUE_OK) {
        await deleteCandidat(candidat)
        logger.warn(`Ce candidat ${email} a été detruit: PRATIQUE OK`)
        mailType = EPREUVE_PRATIQUE_OK
        recipient = candidatAurige
      }
      if (mailType) {
        sendMailToAccount(recipient, mailType)
        return getCandidatStatus(nomNaissance, codeNeph, 'success')
      }

      if (candidatExistant === CANDIDAT_EXISTANT) {
        const { isValid } = candidat

        candidat.set({
          dateReussiteETG,
          dateDernierEchecPratique,
          reussitePratique,
          isValid: true,
        })
        return candidat
          .save()
          .then(candidat => {
            if (isValid) {
              logger.warn(`Ce candidat ${candidat.email} a été mis à jour`)
              return getCandidatStatus(nomNaissance, codeNeph, 'success')
            } else {
              logger.warn(`Ce candidat ${candidat.email} a été validé`)
              const token = createToken(
                candidat.id,
                config.USER_STATUS_LEVEL.candidat
              )

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
