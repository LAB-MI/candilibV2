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
import { createCentre, deleteCentre, findCentreByNameAndDepartement } from '../../models/centre'
import { createInspecteurs, createTestPlace, inspecteursTests } from '../../models/__tests__'
import { getFrenchLuxonFromObject } from '../../util'

describe('Centres business', () => {
  let admin

  beforeAll(async () => {
    await connect()
    const departements = ['92', '93']
    const email = 'admin@example.com'
    const password = 'S3cr3757uff!'
    admin = await createUser(email, password, departements)
    await createInspecteurs()
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

  it('Should add one centre', async () => {
    const centreAdded = await addCentre(
      'CentreTest',
      'LabelTest',
      '1 94000 ',
      42,
      104,
      '93',
    )

    expect(centreAdded).toBeDefined()
    expect(centreAdded).not.toBeNull()
    expect(centreAdded).toHaveProperty('nom', 'CENTRETEST')
    expect(centreAdded).toHaveProperty('label', 'LabelTest')
    expect(centreAdded).toHaveProperty('departement', '93')
    expect(centreAdded).toHaveProperty('geoDepartement', '94')
    expect(centreAdded).toHaveProperty('active', true)
  })

  it('Should update a center', async () => {
    const originalCentre = await findCentreByNameAndDepartement(
      centres[0].nom,
      centres[0].departement,
    )
    const updatedCentre = await updateCentre(
      originalCentre._id,
      {
        nom: 'Nouveau nom',
        lon: 45.3,
        lat: 8,
      },
      admin._id,
    )

    expect(updatedCentre).toBeDefined()
    expect(updatedCentre).not.toBeNull()
    expect(updatedCentre).toHaveProperty('nom', 'NOUVEAU NOM')
    expect(updatedCentre).toHaveProperty('label', centres[0].label)
    expect(updatedCentre).toHaveProperty('geoloc')
    expect(updatedCentre.geoloc).toHaveProperty('coordinates')
    expect(updatedCentre.geoloc.coordinates).toHaveProperty('0', 45.3)
    expect(updatedCentre.geoloc.coordinates).toHaveProperty('1', 8)
  })

  describe('Test disable and enable centre', () => {
    const centreTest = {
      departement: '93',
      nom: 'CENTRE STATUS',
      label: "Centre d'examen pour la modification de status ",
      adresse: '3 Avenue test, ville test 3, FR, 93000',
      lon: 49,
      lat: 2.5,
      geoDepartement: '75',
    }
    let testCentre

    const dateYesterday = getFrenchLuxonFromObject({ hour: 11 })
      .minus({ days: 1 })
      .toISO()

    beforeEach(async () => {
      const {
        nom,
        label,
        adresse,
        lon,
        lat,
        departement,
        geoDepartement,
      } = centreTest

      testCentre = await createCentre(nom,
        label,
        adresse,
        lon,
        lat,
        departement,
        geoDepartement,
      )
    })

    afterEach(async () => {
      await deleteCentre(testCentre)
    })

    it('Should disable one centre', async () => {
      const disabledCentre = await updateCentreStatus(
        testCentre._id,
        false,
        admin._id,
      )

      expect(disabledCentre).toBeDefined()
      expect(disabledCentre).not.toBeNull()
      expect(disabledCentre).toHaveProperty('nom', testCentre.nom)
      expect(disabledCentre).toHaveProperty('label', testCentre.label)
      expect(disabledCentre).toHaveProperty('active', false)
      expect(disabledCentre).toHaveProperty('disabledBy', admin.email)
      expect(disabledCentre.disabledAt).toBeInstanceOf(Date)
    })

    it('Should enable one centre', async () => {
      testCentre.active = false
      await testCentre.save()
      const disabledCentre = await updateCentreStatus(
        testCentre._id,
        true,
        admin._id,
      )

      expect(disabledCentre).toBeDefined()
      expect(disabledCentre).not.toBeNull()
      expect(disabledCentre).toHaveProperty('nom', testCentre.nom)
      expect(disabledCentre).toHaveProperty('label', testCentre.label)
      expect(disabledCentre).toHaveProperty('active', true)
    })

    it('Should can not disable one centre with one place on the future', async () => {
      const placeBeforeMonth = {
        date: (() => getFrenchLuxonFromObject({ hour: 9 }).plus({ days: 1, hour: 1 }).toISO())(),
        centre: testCentre.nom,
        inspecteur: inspecteursTests[1],
        createdAt: dateYesterday,
        visibleAt: dateYesterday,
      }

      await createTestPlace(placeBeforeMonth)
      await expect(updateCentreStatus(
        testCentre._id,
        false,
        admin._id,
      )).rejects.toThrow('Le centre possède des places à venir, il ne peut pas être archivé.')
    })

    it('Should disable one centre with the places in past', async () => {
      const placeBeforeMonth = {
        date: (() => getFrenchLuxonFromObject({ hour: 9 }).minus({ days: 1, hour: 1 }).toISO())(),
        centre: testCentre.nom,
        inspecteur: inspecteursTests[1],
        createdAt: dateYesterday,
        visibleAt: dateYesterday,
      }

      await createTestPlace(placeBeforeMonth)

      const disabledCentre = await updateCentreStatus(
        testCentre._id,
        false,
        admin._id,
      )

      expect(disabledCentre).toBeDefined()
      expect(disabledCentre).not.toBeNull()
      expect(disabledCentre).toHaveProperty('nom', testCentre.nom)
      expect(disabledCentre).toHaveProperty('label', testCentre.label)
      expect(disabledCentre).toHaveProperty('active', false)
      expect(disabledCentre).toHaveProperty('disabledBy', admin.email)
      expect(disabledCentre.disabledAt).toBeInstanceOf(Date)
    })
  })
})
