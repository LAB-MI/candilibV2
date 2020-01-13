import { connect, disconnect } from '../../mongo-connection'

import {
  setInitCreatedCentre,
  createCentres,
  removeCentres,
  nbCentres,
  centres,
} from '../../models/__tests__/centres'

import {
  addCentre,
  findAllCentresForAdmin,
  updateCentreStatus,
  updateCentre,
} from './centre-business'
import { createUser } from '../../models/user'
import { findCentreByNameAndDepartement } from '../../models/centre'

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
    expect(disabledCentre).toHaveProperty('disabledBy', admin.email)
    expect(disabledCentre.disabledAt).toBeInstanceOf(Date)
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

  it('Should add one centre', async () => {
    const centreAdded = await addCentre(
      'CentreTest',
      'LabelTest',
      '1',
      42,
      104,
      '93'
    )

    expect(centreAdded).toBeDefined()
    expect(centreAdded).not.toBeNull()
    expect(centreAdded).toHaveProperty('nom', 'CentreTest')
    expect(centreAdded).toHaveProperty('label', 'LabelTest')
    expect(centreAdded).toHaveProperty('departement', '93')
    expect(centreAdded).toHaveProperty('active', true)
  })

  it('Should update a center', async () => {
    const originalCentre = await findCentreByNameAndDepartement(
      centres[0].nom,
      centres[0].departement
    )
    const updatedCentre = await updateCentre(
      originalCentre._id,
      {
        nom: 'Nouveau nom',
        lon: 45.3,
        lat: 8,
      },
      admin._id
    )

    expect(updatedCentre).toBeDefined()
    expect(updatedCentre).not.toBeNull()
    expect(updatedCentre).toHaveProperty('nom', 'Nouveau nom')
    expect(updatedCentre).toHaveProperty('label', centres[0].label)
    expect(updatedCentre).toHaveProperty('geoloc')
    expect(updatedCentre.geoloc).toHaveProperty('coordinates')
    expect(updatedCentre.geoloc.coordinates).toHaveProperty('0', 45.3)
    expect(updatedCentre.geoloc.coordinates).toHaveProperty('1', 8)
  })
})
