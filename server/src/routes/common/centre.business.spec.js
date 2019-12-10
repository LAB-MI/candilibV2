import { connect, disconnect } from '../../mongo-connection'

import {
  setInitCreatedCentre,
  createCentres,
  removeCentres,
  nbCentres,
  centres,
} from '../../models/__tests__/centres'

import { findAllCentresForAdmin, updateCentreStatus } from './centre.business'

describe('Centres business', () => {
  beforeAll(async () => {
    await connect()
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

    await updateCentreStatus(testCentre._id, false)

    const allCentresAfter = await findAllCentresForAdmin([
      centres[0].departement,
    ])
    const disabledCentre = allCentresAfter.filter(centre => !centre.active)[0]

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

    await updateCentreStatus(testCentre._id, true)

    const allCentresAfter = await findAllCentresForAdmin([
      centres[0].departement,
    ])
    const disabledCentre = allCentresAfter.filter(
      centre => centre.active && centre.nom === centres[0].nom
    )[0]

    expect(disabledCentre).toBeDefined()
    expect(disabledCentre).not.toBeNull()
    expect(disabledCentre).toHaveProperty('nom', centres[0].nom)
    expect(disabledCentre).toHaveProperty('label', centres[0].label)
    expect(disabledCentre).toHaveProperty('active', true)
  })
})
