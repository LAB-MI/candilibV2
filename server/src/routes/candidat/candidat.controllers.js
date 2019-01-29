// import { synchroAurige, getCandidatsAsCsv } from './business'
import { email as emailRegex, logger } from '../../util'
import { createCandidat, findCandidatByEmail } from '../../models/candidat'
import { findWhitelistedByEmail } from '../../models/whitelisted'

export async function preSignup (req, res) {
  const candidatData = req.body
  const { codeNeph, nomNaissance, portable, adresse, email } = candidatData

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

  const candidatWithSameEmail = await findCandidatByEmail(email)
  if (candidatWithSameEmail) {
    res.status(409).json({
      success: false,
      message:
        'Vous avez déjà un compte sur Candilib, veuillez cliquer sur le lien "Déjà inscrit"',
    })
    return
  }

  try {
    const candidat = await createCandidat(candidatData)
    res.status(200).json({ success: true, candidat })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ success: false, ...error })
  }
}
