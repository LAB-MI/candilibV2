import { createCandidat } from '../src/models/candidat'

import { simpleLogger as logger } from '../src/util'

import candidats from './candidats'
// import candidatsValid from './candidatsValid'

logger.info('Creating candidats')

const createValidCandidats = async () => {
  const candidats = [
    {
      codeNeph: '61234567898',
      prenom: 'CC_FRONT',
      nomNaissance: 'CANDIDAT_FRONT',
      adresse: '40 Avenue des terroirs de France 75012 Paris',
      portable: '0676543986',
      email: 'candidat_front@candi.lib',
      departement: '75',
      isEvaluationDone: false,
      isValidatedEmail: true,
      isValidatedByAurige: true,
    },
    {
      codeNeph: '61234567899',
      prenom: 'CC_INTERACTIVE',
      nomNaissance: 'CANDIDAT_INTERACTIVE',
      adresse: '40 Avenue des terroirs de France 75012 Paris',
      portable: '0676543986',
      email: 'candidat_interactive@candi.lib',
      departement: '75',
      isEvaluationDone: false,
      isValidatedEmail: true,
      isValidatedByAurige: true,
    },
    {
      codeNeph: '61234567897',
      prenom: 'CC_DELAY_AFTER_FAILURE',
      nomNaissance: 'CANDIDAT_DELAY_AFTER_FAILURE',
      adresse: '40 Avenue des terroirs de France 75012 Paris',
      portable: '0676543986',
      email: 'candidat_delay_after_failure@candi.lib',
      departement: '75',
      isEvaluationDone: true,
      isValidatedEmail: true,
      isValidatedByAurige: true,
    },
    {
      codeNeph: '61234567896',
      prenom: 'CC_STATS_KPI',
      nomNaissance: 'CANDIDAT_STATS_KPI',
      adresse: '40 Avenue des terroirs de France 75012 Paris',
      portable: '0676543986',
      email: 'candidat_stats_kpi@candi.lib',
      departement: '75',
      isEvaluationDone: false,
      isValidatedEmail: true,
      isValidatedByAurige: true,
    },
  ]
  candidats.map(async candidat => {
    const candidatCreated = await createCandidat(candidat)
    candidatCreated.isValidatedEmail = candidat.isValidatedEmail
    candidatCreated.isValidatedByAurige = candidat.isValidatedByAurige
    candidatCreated.isEvaluationDone = candidat.isEvaluationDone
    candidatCreated.dateReussiteETG = candidat.dateReussiteETG || new Date()
    return candidatCreated.save()
  })
}

export default async () => {
  await createValidCandidats()
  const candidatsCreated = candidats.map(candidat =>
    createCandidat(candidat)
      .then(() => {
        logger.info(`Compte candidat ${candidat.codeNeph} créé !`)
      })
      .catch(error => logger.error(error))
  )
  return Promise.all(candidatsCreated)
}
