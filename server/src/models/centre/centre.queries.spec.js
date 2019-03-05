import { connect, disconnect } from '../../mongo-connection'
import {
  findCentresByDepartement,
  findAllCentres,
  findCentreByName,
  findCentreByNameAndDepartement,
} from './centre.queries'
import {
  createCentres,
  removeCentres,
  nbCentres,
  centres,
} from '../__tests__/centres'

describe('Centre', () => {
  beforeAll(async () => {
    await connect()
  })

  afterAll(async () => {
    await disconnect()
  })

  describe('Find centre', () => {
    beforeAll(async () => {
      await createCentres()
    })

    afterAll(async () => {
      await removeCentres()
    })

    it('Should find one centres by name', async () => {
      const centresResult = await findCentreByName(centres[2].nom)
      expect(centresResult).toBeDefined()
      expect(centresResult).not.toBeNull()
      expect(centresResult).toHaveProperty('nom', centres[2].nom)
      expect(centresResult).toHaveProperty('label', centres[2].label)
      expect(centresResult).toHaveProperty('adresse', centres[2].adresse)
      expect(centresResult).toHaveProperty(
        'departement',
        centres[2].departement
      )
    })

    it('Should find all centres, there are 3 centres', async () => {
      const centresResult = await findAllCentres()
      expect(centresResult).toBeDefined()
      expect(centresResult).not.toBeNull()
      expect(centresResult).toHaveLength(nbCentres())
    })

    it('Should find 2 centres from 93', async () => {
      const departement = '93'
      const centresResult = await findCentresByDepartement(departement)
      expect(centresResult).toBeDefined()
      expect(centresResult).toHaveLength(nbCentres(departement))
    })

    it('Should find one centre by deparetement and name', async () => {
      const departement = '93'
      try {
        const centresResult = await findCentreByNameAndDepartement(
          centres[2].nom,
          departement
        )
        expect(centresResult).toBeDefined()
        expect(centresResult).toHaveProperty('nom', centres[2].nom)
        expect(centresResult).toHaveProperty('departement', departement)
      } catch (error) {
        expect(error).toBeUndefined()
      }
    })
  })
})
