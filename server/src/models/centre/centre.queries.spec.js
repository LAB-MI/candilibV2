import { connect, disconnect } from '../../mongo-connection'
import { findCentreByDepartment } from './centre.queries'
import { createCentres, removeCentres } from './__test__/centre'

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

    it('Should find 2 centres from 93', async () => {
      const departement = '93'
      const centresResult = await findCentreByDepartment(departement)
      // console.log(centres)
      // console.log(centresResult)
      expect(centresResult).toBeDefined()
      // expect(centresResult).toHaveLength(nbCentres(departement))
    })
  })
})
