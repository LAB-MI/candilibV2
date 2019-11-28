import { getCandidatConfigBusiness } from './candidat-config-business'
require('dotenv').config()

describe('Get config for candidat', () => {
  it('Should return config', async () => {
    // GIVEN
    const expectedLineDelay = Number(process.env.LINE_DELAY)

    // WHEN
    const config = getCandidatConfigBusiness()

    // THEN
    expect(config).toHaveProperty('lineDelay', expectedLineDelay)
  })
})
