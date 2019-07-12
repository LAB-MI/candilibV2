import { createCandidat } from '../../../../models/candidat'
import config from '../../../../config'
import { getFrenchLuxon } from '../../../../util'

const nowLuxon = getFrenchLuxon()

const dateReussiteETG = nowLuxon
  .minus({ days: 5 })
  .startOf('day')
  .toISO()

const dateReussiteETGKO = nowLuxon
  .minus({ years: 5 })
  .startOf('day')
  .toISO()

export const dateTimeDernierEchecPratique = nowLuxon
  .minus({ days: 5 })
  .startOf('day')

const dateDernierEchecPratique = dateTimeDernierEchecPratique
  .toISO()
  .split('T')[0]

const dateDernierEchecPratiqueAncien = nowLuxon
  .minus({ days: config.timeoutToRetry })
  .startOf('day')
  .toISO()

const dateReussitePratique = nowLuxon
  .minus({ days: 5 })
  .startOf('day')
  .toISO()

const isValidatedEmail = true
const adresse = '40 Avenuedes terroirs de France 75012 Paris'
const portable = '0676543986'

export const candidatFailureExam = {
  // candidat échec pratique récent
  codeNeph: '0938743208650',
  nomNaissance: 'ZANETTI',
  prenom: 'BUBBA',
  email: 'bubbazanetti1@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '2',
  dateDernierNonReussite: dateDernierEchecPratique,
  objetDernierNonReussite: 'echec',
  reussitePratique: '',
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  adresse,
  portable,
}

export const candidatFailureExamWith5Failures = {
  // candidat avec 5 échec pratique récent
  codeNeph: '0938743208651',
  nomNaissance: 'TEST',
  prenom: 'Fivefailures',
  email: 'fivefailures.test@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '5',
  dateDernierNonReussite: dateDernierEchecPratique,
  objetDernierNonReussite: 'echec',
  reussitePratique: '',
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  adresse,
  portable,
}

export const candidatPassed = {
  // Candidat réussi la pratique
  codeNeph: '093123456789',
  nomNaissance: 'MAD',
  prenom: 'MAX',
  email: 'madmax@candilib.com',
  dateReussiteETG,
  nbEchecsPratiques: '',
  dateDernierNonReussite: '',
  objetDernierNonReussite: '',
  reussitePratique: dateReussitePratique,
  candidatExistant: 'OK',
  isValidatedByAurige: false,
  isValidatedEmail,
  adresse,
  portable,
}

const candidatsToValidAurige = [
  candidatPassed,
  {
    // Candidat n'existe pas
    codeNeph: '093458736982',
    nomNaissance: 'ROCKATANSKY',
    prenom: 'JESSIE',
    email: 'jessierockatansky@candilib.com',
    dateReussiteETG: '',
    nbEchecsPratiques: '',
    dateDernierNonReussite: '',
    objetDernierNonReussite: '',
    reussitePratique: '',
    candidatExistant: 'NOK',
    isValidatedByAurige: false,
    isValidatedEmail,
    adresse,
    portable,
  },
  {
    // Candidat nom n'existe pas
    codeNeph: '093571369217',
    nomNaissance: 'CUTTER',
    prenom: 'TOE',
    email: 'toecutter@candilib.com',
    dateReussiteETG: '',
    nbEchecsPratiques: '',
    dateDernierNonReussite: '',
    objetDernierNonReussite: '',
    reussitePratique: '',
    candidatExistant: 'NOK Nom',
    isValidatedByAurige: false,
    isValidatedEmail,
    adresse,
    portable,
  },
  {
    // candidat échec pratique il y a plus 45 jours
    codeNeph: '093621795384',
    nomNaissance: 'GOOSE',
    prenom: 'JIM',
    email: 'jimgoose@candilib.com',
    dateReussiteETG,
    nbEchecsPratiques: '3',
    dateDernierNonReussite: dateDernierEchecPratiqueAncien,
    objetDernierNonReussite: 'absent',
    reussitePratique: '',
    candidatExistant: 'OK',
    isValidatedByAurige: false,
    isValidatedEmail,
    adresse,
    portable,
  },
  {
    // candidat pas d'info réssuit théorique
    codeNeph: '093365721896',
    nomNaissance: 'BOY',
    prenom: 'JOHNNY',
    email: 'johnnyboy@candilib.com',
    dateReussiteETG: '',
    nbEchecsPratiques: '',
    dateDernierNonReussite: '',
    objetDernierNonReussite: '',
    reussitePratique: '',
    candidatExistant: 'OK',
    isValidatedByAurige: false,
    isValidatedEmail,
    adresse,
    portable,
  },
  {
    // candidat réussit la théorie y a plus de 5 ans
    codeNeph: '093631754283',
    nomNaissance: 'MCAFFEE',
    prenom: 'FIFI',
    email: 'fifimcaffee@candilib.com',
    dateReussiteETG: dateReussiteETGKO,
    nbEchecsPratiques: '',
    dateDernierNonReussite: '',
    objetDernierNonReussite: '',
    reussitePratique: '',
    candidatExistant: 'OK',
    isValidatedByAurige: false,
    isValidatedEmail,
    adresse,
    portable,
  },
  {
    // candidat réussit la théorie y a moins 5 ans
    codeNeph: '093496239512',
    nomNaissance: 'SWAISEY',
    prenom: 'MAY',
    email: 'mayswaisey@candilib.com',
    dateReussiteETG,
    nbEchecsPratiques: '',
    dateDernierNonReussite: '',
    objetDernierNonReussite: '',
    reussitePratique: '',
    candidatExistant: 'OK',
    isValidatedByAurige: false,
    isValidatedEmail,
    adresse,
    portable,
  },
  candidatFailureExam,
]

export const createCandidatToTestAurige = async (
  candidat,
  isValidatedByAurige = false
) => {
  const candidatCreated = await createCandidat(candidat)
  candidatCreated.isValidatedEmail = true
  candidatCreated.isValidatedByAurige = isValidatedByAurige
  return candidatCreated.save()
}

export const createCandidatsToTestAurige = async () => {
  return Promise.all(candidatsToValidAurige.map(createCandidatToTestAurige))
}
