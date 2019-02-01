import { sendMailToAccount } from '../business/send-mail'
import { INSCRIPTION_UPDATE, INSCRIPTION_OK } from '../../util'
import {
  updateCandidatSignUp,
  findCandidatByNomNeph,
  createCandidat,
} from '../../models/candidat'

export async function CheckCandidatIsSignedBefore (candidatData) {
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
            'Vous avez déjà pré-inscrist sur Candilib, votre compte est en cours de vérification',
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
            'La modification des vos informations ont bien été prise en compte. Veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
          candidat: updateCandidat,
        }
      } catch (error) {
        throw new Error(
          "Un problème est survenu lors de l'envoi du lien de connexion. Nous vous prions de réessayer plus tard."
        )
      }
    }
    return {
      success: true,
      candidat: updateCandidat,
      message:
        'La modification des vos informations ont bien été prise en compte.',
    }
  }
  return {
    success: false,
    message: 'Echec de mise à jours de votre compte',
  }
}

export async function signUpCandidat (candidatData) {
  const candidat = await createCandidat(candidatData)
  try {
    const response = await sendMailToAccount(candidat, INSCRIPTION_OK)
    return {
      success: true,
      response,
      message:
        'Votre demande a été prise en compte, veuillez consulter votre messagerie (pensez à vérifier dans vos courriers indésirables).',
      candidat,
    }
  } catch (error) {
    throw new Error(
      "Un problème est survenu lors de l'envoi du lien de connexion. Nous vous prions de réessayer plus tard."
    )
  }
}
