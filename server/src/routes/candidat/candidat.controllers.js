// import { synchroAurige, getCandidatsAsCsv } from './business'
import { email as emailRegex, logger } from '../../util'
import { findCandidatByEmail, findCandidatById } from '../../models/candidat'
import { findWhitelistedByEmail } from '../../models/whitelisted'
import {
  CheckCandidatIsSignedBefore,
  updateInfoCandidat,
  signUpCandidat,
} from './candidat.business'

export async function preSignup (req, res) {
  const candidatData = req.body
  const candidatDataTrim = {
    codeNeph: candidatData.codeNeph
      ? candidatData.codeNeph.trim()
      : candidatData.codeNeph,
    nomNaissance: candidatData.nomNaissance
      ? candidatData.nomNaissance.trim()
      : candidatData.nomNaissance,
    prenom: candidatData.prenom
      ? candidatData.prenom.trim()
      : candidatData.prenom,
    portable: candidatData.portable
      ? candidatData.portable.trim()
      : candidatData.portable,
    adresse: candidatData.adresse
      ? candidatData.adresse.trim()
      : candidatData.adresse,
    email: candidatData.email ? candidatData.email.trim() : candidatData.email,
  }

  const { codeNeph, nomNaissance, portable, adresse, email } = candidatDataTrim

  const isFormFilled = [codeNeph, nomNaissance, email, portable, adresse].every(
    e => !!e
  )

  const isValidEmail = emailRegex.test(email)

  if (!isFormFilled) {
    const fieldsWithErrors = [
      'codeNeph',
      'nomNaissance',
      'email',
      'portable',
      'adresse',
    ]
      .map(key => (candidatData[key] ? '' : key))
      .filter(e => e)

    if (!isValidEmail && !fieldsWithErrors.includes('email')) {
      fieldsWithErrors.push('email')
    }

    res.status(400).json({
      success: false,
      message: 'Veuillez renseigner tous les champs obligatoires',
      fieldsWithErrors,
    })
    return
  }

  if (!isValidEmail) {
    res.status(400).json({
      success: false,
      message: "L'email renseigné n'est pas valide",
      fieldsWithErrors: ['email'],
    })
    return
  }

  const isCandidatWhitelisted = await findWhitelistedByEmail(email)

  if (!isCandidatWhitelisted) {
    res.status(401).json({
      success: false,
      message: 'Ce site sera ouvert prochainement.',
    })
    return
  }

  const isSigned = await CheckCandidatIsSignedBefore(candidatDataTrim)
  if (isSigned && isSigned.result) {
    res.status(409).json(isSigned.result)
    return
  }

  const candidatWithSameEmail = await findCandidatByEmail(email)

  if (
    candidatWithSameEmail &&
    !(
      isSigned &&
      isSigned.candidat &&
      isSigned.candidat.email === candidatWithSameEmail.email
    )
  ) {
    res.status(409).json({
      success: false,
      message:
        'Vous avez déjà un compte sur Candilib, veuillez cliquer sur le lien "Déjà inscrit"',
    })
    return
  }

  if (isSigned && isSigned.candidat) {
    const updateresult = await updateInfoCandidat(
      isSigned.candidat,
      candidatDataTrim
    )

    if (updateresult.success) {
      res.status(200).json(updateresult)
    } else {
      res.status(409).json(updateresult)
    }
    return
  }

  try {
    const response = await signUpCandidat(candidatDataTrim)
    res.status(200).json(response)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ success: false, ...error })
  }
}

export async function getMe (req, res) {
  try {
    const options = {
      _id: 0,
      nomNaissance: 1,
      prenom: 1,
      codeNeph: 1,
      email: 1,
      portable: 1,
      adresse: 1,
    }

    const candidat = await findCandidatById(req.userId, options)

    res.json({
      candidat,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
