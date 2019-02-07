import { sendMailToAccount } from '../business/send-mail'
import {
  INSCRIPTION_UPDATE,
  INSCRIPTION_OK,
  VALIDATION_EMAIL,
} from '../../util'
import {
  updateCandidatSignUp,
  updateCandidatById,
  findCandidatByNomNeph,
  createCandidat,
  findCandidatByEmail,
} from '../../models/candidat'

const uuidv4 = require('uuid/v4')

export async function checkCandidatIsSignedBefore (candidatData) {
  const {
    nomNaissance,
    codeNeph,
    email,
    prenom,
    portable,
    adresse,
  } = candidatData
  const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)

  if (candidat) {
    if (candidat.isValid === true) {
      return {
        result: {
          success: false,
          message:
            'Vous avez déjà un compte sur Candilib, veuillez cliquer sur le lien "Déjà inscrit"',
        },
      }
    }
    if (
      candidat.email === email &&
      candidat.prenom === prenom &&
      candidat.portable === portable &&
      candidat.adresse === adresse
    ) {
      return {
        result: {
          success: false,
          message:
            'Vous êtes déjà pré-inscrit sur Candilib, votre compte est en cours de vérification.',
        },
      }
    }
  }

  return { candidat }
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

  const candidat = await createCandidat(candidatData)
  const response = await sendMailToAccount(candidat, VALIDATION_EMAIL)
  return {
    success: true,
    response,
    message: `Un email a été envoyé à ${
      candidatData.email
    }, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).`,
    candidat,
  }
}

export async function validateEmail (email, hash) {
  try {
    const candidat = await findCandidatByEmail(email)

    const updatedCandidat = await updateCandidatById(candidat._id, {
      isValidatedEmail: true,
      emailValidationHash: undefined,
    })

    if (candidat.emailValidationHash !== hash) {
      throw new Error('La validation de votre email a échouée.')
    }
    const response = await sendMailToAccount(candidat, INSCRIPTION_OK)
    return {
      success: true,
      response,
      message:
        'Votre email a été validé, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
      updatedCandidat,
    }
  } catch (error) {
    throw error
  }
}
