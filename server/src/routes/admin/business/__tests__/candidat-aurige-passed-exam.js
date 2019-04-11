// TODO: A merger avec celui de la branch #260
import { DateTime } from 'luxon'
import { createCandidat } from '../../../../models/candidat'

const dateReussiteETG = DateTime.local()
  .minus({ days: 5 })
  .startOf('day')
  .toISO({ zone: 'utc' })
const isValidatedEmail = true
const adresse = '40 Avenuedes terroirs de France 75012 Paris'
const portable = '0676543986'
export const candidatPassed = {
  codeNeph: '093123456789',
  nomNaissance: 'MAD',
  prenom: 'MAX',
  email: 'madmax@candilib.com',
  dateReussiteETG,
  dateDernierEchecPratique: '',
  reussitePratique: 'OK',
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  adresse,
  portable,
}

export const createCandidatToTestAurige = async (
  candidat,
  isValidatedByAurige = false
) => {
  const candidatCreated = await createCandidat(candidat)
  candidatCreated.isValidatedEmail = true
  candidatCreated.isValidatedByAurige = isValidatedByAurige
  return candidatCreated.save()
}
