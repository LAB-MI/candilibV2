import { connect, disconnect } from '../../mongo-connection'

import { createCandidats, deleteCandidats } from '../../models/__tests__'
import { getInfoCandidatDepartement } from './candidat.business'

describe('Test the candidat business', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Test get information candidat', () => {
    let createdCandidats
    beforeAll(async () => {
      createdCandidats = await createCandidats()
    })
    afterAll(async () => {
      await deleteCandidats()
    })

    it('get infomartion candidat with departement 75', async () => {
      const { _id } = createdCandidats[0]
      const codeDep = await getInfoCandidatDepartement(_id)

      expect(codeDep).toBeDefined()
      expect(codeDep).toBe('75')
    })
  })
})
