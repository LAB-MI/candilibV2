import { createInspecteur, deleteInspecteurById } from '../../models/inspecteur'
import { EMAIL_ALREADY_SET, EMAIL_EXISTE } from '../../models/inspecteur/inspecteur.constants'
import { connect, disconnect } from '../../mongo-connection'
import { updateInspecteur } from './inspecteurs-business'

// inspecteur
const validEmail = 'dontusethis@example.fr'
const validEmail1 = 'dontusethis1@example.fr'
const anotherValidEmail = 'dontusethis@example.com'
const anotherValidEmail1 = 'dontusethis1@example.com'

const ipcsrs = [
  {
    departement: '93',
    email: validEmail,
    matricule: '153424',
    nom: 'Dupont',
    prenom: 'Jacques',
  },
  {
    departement: '93',
    email: anotherValidEmail,
    matricule: '1534241',
    nom: 'Dupont1',
    prenom: 'Jacques',
  },
  {
    departement: '93',
    email: validEmail1,
    matricule: '1534242',
    nom: 'Dupont2',
    prenom: 'Jacques',
    secondEmail: [anotherValidEmail1],
  },

]

describe('inspecteurs buisiness', () => {
  let inspecteurs
  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    inspecteurs = await Promise.all(ipcsrs.map(createInspecteur))
  })
  afterEach(async () => {
    await Promise.all(inspecteurs.map(({ _id }) => deleteInspecteurById(_id)))
  })
  afterAll(async () => {
    await disconnect()
  })

  it('Should update second email of ipcsr ', async () => {
    const ipcsr = inspecteurs[0]
    const update = { secondEmail: 'test@test.com' }
    const inspecteur = await updateInspecteur(ipcsr._id, update)
    expect(inspecteur).toBeDefined()
    expect(inspecteur).toEqual(expect.objectContaining({
      ...ipcsrs[0],
      nom: ipcsrs[0].nom.toUpperCase(),
      secondEmail: expect.arrayContaining(['test@test.com']),
    }))
  })

  it('Should update email of ipcsr', async () => {
    const ipcsr = inspecteurs[0]
    const update = { email: 'test@test.com' }
    const inspecteur = await updateInspecteur(ipcsr._id, update)
    expect(inspecteur).toBeDefined()
    expect(inspecteur).toEqual(expect.objectContaining({
      ...ipcsrs[0],
      nom: ipcsrs[0].nom.toUpperCase(),
      email: 'test@test.com',
    }))
  })

  it('Should update second email of ipcsr with second email', async () => {
    const ipcsr = inspecteurs[2]
    const update = { secondEmail: 'test@test.com' }
    const inspecteur = await updateInspecteur(ipcsr._id, update)
    expect(inspecteur).toBeDefined()
    expect(inspecteur).toEqual(expect.objectContaining({
      ...ipcsrs[2],
      nom: ipcsrs[2].nom.toUpperCase(),
      secondEmail: expect.arrayContaining(['test@test.com']),
    }))
  })

  it('Should update all values of ipcsr', async () => {
    const ipcsr = inspecteurs[0]
    const update = { ...ipcsr[0], secondEmail: 'test@test.com' }
    const inspecteur = await updateInspecteur(ipcsr._id, update)
    expect(inspecteur).toBeDefined()
    expect(inspecteur).toEqual(expect.objectContaining({
      ...ipcsrs[0],
      nom: ipcsrs[0].nom.toUpperCase(),
      secondEmail: expect.arrayContaining(['test@test.com']),
    }))
  })

  it('Should not update same second email other email of ipcsr', async () => {
    const ipcsr = inspecteurs[0]
    await expect(updateInspecteur(ipcsr._id, { secondEmail: inspecteurs[1].email })).rejects.toThrow(EMAIL_EXISTE(inspecteurs[1].email))
  })

  it('Should not update same second email and email of ipcsr', async () => {
    const ipcsr = inspecteurs[0]
    await expect(updateInspecteur(ipcsr._id, { secondEmail: inspecteurs[0].email })).rejects.toThrow(EMAIL_ALREADY_SET(inspecteurs[0].email))
  })
})
