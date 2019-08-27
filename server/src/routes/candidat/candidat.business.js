import { sendMailToAccount } from '../business/send-mail'
import {
  appLogger,
  INSCRIPTION_OK,
  INSCRIPTION_UPDATE,
  VALIDATION_EMAIL,
  techLogger,
} from '../../util'
import { findWhitelistedByEmail } from '../../models/whitelisted'
import {
  createCandidat,
  deleteCandidat,
  findCandidatByEmail,
  findCandidatByNomNeph,
  updateCandidatById,
  updateCandidatSignUp,
} from '../../models/candidat'
import { isMoreThan2HoursAgo } from '../admin/business/synchro-aurige'

const uuidv4 = require('uuid/v4')

export async function isAlreadyPresignedUp (candidatData) {
  const {
    adresse,
    codeNeph,
    email,
    nomNaissance,
    portable,
    prenom,
  } = candidatData

  const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

  if (!candidat) {
    return {
      success: true,
    }
  }

  const {
    adresse: existCandidatAdresse,
    email: existCandidatEmail,
    isValidatedByAurige,
    isValidatedEmail,
    portable: existCandidatPortable,
    prenom: existCandidatPrenom,
    presignedUpAt,
  } = candidat

  if (isValidatedByAurige) {
    return {
      success: false,
      conflict: true,
      message:
        'Vous avez déjà un compte sur Candilib, veuillez cliquer sur le lien "Déjà inscrit"',
    }
  }

  if (!isValidatedEmail && isMoreThan2HoursAgo(presignedUpAt)) {
    await deleteCandidat(candidat, 'EMAIL_NOT_VERIFIED_EXPIRED')
    return { success: true }
  }

  if (
    isValidatedEmail ||
    (existCandidatEmail === email &&
      existCandidatPrenom === prenom &&
      existCandidatPortable === portable &&
      existCandidatAdresse === adresse)
  ) {
    return {
      success: false,
      conflict: true,
      message:
        "Vous êtes déjà pré-inscrit sur Candilib, votre compte est en cours de vérification par l'administration.",
    }
  }

  if (existCandidatEmail !== email) {
    await deleteCandidat(
      candidat,
      'EMAIL_NOT_VERIFIED_AND_CANDIDAT_CHANGE_HIS_EMAIL'
    )
    return { success: true }
  }

  return { success: true, candidat }
}

export async function updateInfoCandidat (candidat, candidatData) {
  const updateCandidat = await updateCandidatSignUp(candidat, candidatData)

  if (updateCandidat) {
    if (updateCandidat.email === candidat.email) {
      try {
        const response = await sendMailToAccount(
          updateCandidat,
          INSCRIPTION_UPDATE
        )
        return {
          success: true,
          response,
          message:
            'Les modifications de vos informations ont bien été prises en compte. Veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
          candidat: updateCandidat,
        }
      } catch (error) {
        return {
          success: false,
          message: error.message,
        }
      }
    }
    return {
      success: true,
      candidat: updateCandidat,
      message:
        'Les modifications de vos informations ont bien été prises en compte.',
    }
  }
  return {
    success: false,
    message: 'Échec de la mise à jour de votre compte',
  }
}

export async function presignUpCandidat (candidatData) {
  candidatData.emailValidationHash = uuidv4()

  const loggerInfo = {
    section: 'candidat-pre-signup',
    action: 'preSignup',
    candidatId: candidatData._id && candidatData._id.toString(),
  }

  const candidat = await createCandidat(candidatData)
  appLogger.info({
    ...loggerInfo,
    description: 'Candidat créé et email envoyé',
  })
  try {
    const response = await sendMailToAccount(candidat, VALIDATION_EMAIL)
    appLogger.info({
      ...loggerInfo,
      description: `Mail de validation de la pré-inscription envoyé à ${candidatData.email}`,
    })
    return {
      success: true,
      response,
      message: `Un email a été envoyé à ${candidatData.email}, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).`,
      candidat,
    }
  } catch (error) {
    techLogger.error({
      ...loggerInfo,
      description: `Impossible d'envoyer le mail de pré-inscription à ${candidatData.email} : ${error.message}`,
      error,
    })
    return {
      success: false,
      error,
      message:
        'Votre pré-inscription est bien prise en compte, mais l\'email n\'a pas pu vous être envoyé. Revenez plus tard et cliquez sur "Déjà inscrit"',
      candidat,
    }
  }
}

export async function getDepartementFromWhitelist ({ email, departement }) {
  const whitelisted = await findWhitelistedByEmail(email)

  if (!whitelisted) {
    return null
  }

  if (departement !== whitelisted.departement) {
    appLogger.warn({
      section: 'candidat-pre-signup',
      action: 'INCONSISTENT_DEPARTEMENT',
      description: `Le département de l'adresse du candidat ${departement} est différent de celui de sa whitelist (${whitelisted.departement})`,
      candidatDepartement: departement,
      whitelistDepartement: whitelisted.departement,
    })
  }

  return whitelisted.departement
}

export async function validateEmail (email, hash) {
  const candidat = await findCandidatByEmail(email)

  const updatedCandidat = await updateCandidatById(candidat._id, {
    isValidatedEmail: true,
    emailValidationHash: undefined,
    emailValidatedAt: new Date(),
  })

  if (candidat.emailValidationHash !== hash) {
    appLogger.warn({
      section: 'candidat-validate-email',
      action: 'hash-check',
      description: 'Le hash envoyé lors de la validation ne correspond pas au hash stocké en base',
    })
    return {
      success: false,
      response,
      message:
        "Votre lien n'est plus valide",
      updatedCandidat,
    }

  }
  const response = await sendMailToAccount(candidat, INSCRIPTION_OK)
  appLogger.info({
    section: 'candidat-validate-email',
    action: 'send-mail',
    description: 'Mail de validation de la préinscription envoyé',
  })
  return {
    success: true,
    response,
    message:
      'Votre email a été validé, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
    updatedCandidat,
  }
}
