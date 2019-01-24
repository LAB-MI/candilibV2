// import { synchroAurige, getCandidatsAsCsv } from './business'
import { email as emailRegex, logger } from '../../util'
import { createCandidat } from '../../models/candidat'

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

  try {
    const candidat = await createCandidat(candidatData)
    res.status(200).json({ success: true, candidat })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ success: false, ...error })
  }
}
