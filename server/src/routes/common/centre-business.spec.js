import { connect, disconnect } from '../../mongo-connection'

import {
  setInitCreatedCentre,
  createCentres,
  removeCentres,
  nbCentres,
  centres,
} from '../../models/__tests__/centres'

import { findAllCentresForAdmin, updateCentreStatus } from './centre-business'
import { createUser } from '../../models/user'

describe('Centres business', () => {
  let admin

  beforeAll(async () => {
    await connect()
    const departements = ['92', '93']
    const email = 'admin@example.com'
    const password = 'S3cr3757uff!'
    admin = await createUser(email, password, departements)
    setInitCreatedCentre()
    await createCentres()
  })
  afterAll(async () => {
    await removeCentres()
    await disconnect()
  })

  it('Should find the only centre in the 92', async () => {
    const centresResult = await findAllCentresForAdmin(['92'])
    expect(centresResult).toBeDefined()
    expect(centresResult).not.toBeNull()
    expect(centresResult).toHaveLength(1)
    expect(centresResult[0]).toHaveProperty('nom', centres[0].nom)
    expect(centresResult[0]).toHaveProperty('label', centres[0].label)
  })

  it('Should find all centres, there are 3 centres', async () => {
    const centresResult = await findAllCentresForAdmin(['92', '93'])
    expect(centresResult).toBeDefined()
    expect(centresResult).not.toBeNull()
    expect(centresResult).toHaveLength(nbCentres())
  })

  it('Should disable one centre', async () => {
    const allCentres = await findAllCentresForAdmin([centres[0].departement])
    const testCentre = allCentres.filter(
      centre => centre.nom === centres[0].nom
    )[0]

    const disabledCentre = await updateCentreStatus(
      testCentre._id,
      false,
      admin._id
    )

    expect(disabledCentre).toBeDefined()
    expect(disabledCentre).not.toBeNull()
    expect(disabledCentre).toHaveProperty('nom', centres[0].nom)
    expect(disabledCentre).toHaveProperty('label', centres[0].label)
    expect(disabledCentre).toHaveProperty('active', false)
  })

  it('Should enable one centre', async () => {
    const allCentres = await findAllCentresForAdmin([centres[0].departement])
    const testCentre = allCentres.filter(
      centre => centre.nom === centres[0].nom
    )[0]

    const disabledCentre = await updateCentreStatus(
      testCentre._id,
      true,
      admin._id
    )

    expect(disabledCentre).toBeDefined()
    expect(disabledCentre).not.toBeNull()
    expect(disabledCentre).toHaveProperty('nom', centres[0].nom)
    expect(disabledCentre).toHaveProperty('label', centres[0].label)
    expect(disabledCentre).toHaveProperty('active', true)
  })
})
