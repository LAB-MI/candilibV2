import { connect, disconnect } from '../../mongo-connection'
import { findCentreByDepartment, findAllCentres } from './centre.queries'
import { createCentres, removeCentres, nbCentres } from './__test__/centre'

describe('Centre', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('find centre', () => {
    beforeAll(async () => {
      await createCentres()
    })
    afterAll(async () => {
      await removeCentres()
    })
    it('Should find all centres, there are 3 centres', async () => {
      const centresResult = await findAllCentres()
      expect(centresResult).toBeDefined()
      expect(centresResult).not.toBeNull()
      expect(centresResult).toHaveLength(nbCentres())
    })

    it('Should find 2 centres from 93', async () => {
      const departement = '93'
      const centresResult = await findCentreByDepartment(departement)
      expect(centresResult).toBeDefined()
      expect(centresResult).toHaveLength(nbCentres(departement))
    })
  })
})
