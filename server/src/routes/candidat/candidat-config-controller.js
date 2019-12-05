import { appLogger } from '../../util'
import { getCandidatConfigBusiness } from './business/candidat-config-business'

export async function getCandidatConfig (req, res) {
  const config = getCandidatConfigBusiness()
  appLogger.info({
    description: 'Getting candidat config',
    section: 'candidat-config',
  })
  res.json({ success: true, config })
}
