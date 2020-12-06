import { createCandidat } from '../src/models/candidat'

import { simpleLogger as logger } from '../src/util'

import candidats from './candidats'
import candidatsCypress from './candidatsCypress'

export default () => {
  const candidatsCreated = candidats.map(candidat =>
    createCandidat(candidat)
      .then(() => {
        logger.info(`Compte candidat ${candidat.codeNeph} - ${candidat.email}  créé !`)
      })
      .catch(error => logger.error(error)),
  )

  const candidatsCypressCreated = candidatsCypress.map(candidat => {
    const isValidatedEmail = candidat.isValidatedEmail
    const isValidatedByAurige = candidat.isValidatedByAurige
    const isEvaluationDone = candidat.isEvaluationDone
    const dateReussiteETG = candidat.dateReussiteETG
    const status = candidat.status

    return createCandidat(candidat)
      .then(async candidatCreated => {
        candidatCreated.isValidatedEmail = isValidatedEmail
        candidatCreated.isValidatedByAurige = isValidatedByAurige
        candidatCreated.isEvaluationDone = isEvaluationDone
        candidatCreated.dateReussiteETG = dateReussiteETG || new Date()
        candidatCreated.status = status
        try {
          await candidatCreated.save()
          logger.info(`Compte candidat ${candidatCreated.codeNeph} - ${candidatCreated.email}  créé !`)
        } catch (error) {
          logger.error(error)
        }
      })
      .catch(error => logger.error(error))
  })

  const fusionOfCandidats = candidatsCypressCreated.concat(candidatsCreated)
  return Promise.all(fusionOfCandidats)
}
