import { getCandidatConfigBusiness } from './candidat-config-business'
import config from '../../../config'

describe('Get config for candidat', () => {
  it('Should return config', async () => {
    // GIVEN
    const expectedLineDelay = config.LINE_DELAY

    // WHEN
    const configReceived = getCandidatConfigBusiness()

    // THEN
    expect(configReceived).toHaveProperty('lineDelay', expectedLineDelay)
  })
})
