import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'
import {
  createDepartement,
  deleteDepartementById,
} from '../../models/departement'
import { createCentre, deleteCentre } from '../../models/centre'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const { default: app, apiPrefix } = require('../../app')

describe('Test departements controllers', () => {
  const centre = {
    departement: '75',
    nom: 'Villepinte',
    adresse:
      'avenue Jean Fourgeaud (dernier parking circulaire) 93420 Villepinte',
    lat: '48.962099',
    label: "Centre d'examen du permis de conduire de Villepinte",
    lon: '2.552847',
  }
  const departementData = { _id: '75', email: 'email93@onepiece.com' }
  let createdCentre

  beforeAll(async () => {
    await connect()
    await createDepartement(departementData)
    createdCentre = await createCentre(
      centre.nom,
      centre.label,
      centre.adresse,
      centre.lon,
      centre.lat,
      centre.departement
    )
  })

  afterAll(async () => {
    deleteDepartementById(departementData._id)
    await deleteCentre(createdCentre)
    await disconnect()
    // await app.close()
  })

  describe('deptCenters', () => {
    it('should get departement centers', async () => {
      // GIVEN

      // WHEN
      const { body } = await request(app)
        .get(`${apiPrefix}/centres/75`)
        .set('Accept', 'application/json')
        .expect(200)

      // THEN
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('deptCenters')
      expect(body.deptCenters[0]).toHaveProperty('nom', centre.nom)
    })
  })
})
