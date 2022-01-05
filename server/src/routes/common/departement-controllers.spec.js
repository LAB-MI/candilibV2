import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import { createCentres, removeCentres } from '../../models/__tests__/centres'
import { createCentre } from '../../models/centre'
import { createDepartement } from '../../models/departement'
import { placesAndGeoDepartementsAndCentresCache } from '../middlewares'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const { default: app, apiPrefix } = require('../../app')

const centre69 = {
  departement: '69',
  nom: 'CENTRE 4',
  label: "Centre d'examen 4",
  adresse: '3 Avenue test, ville test 3, FR, 93000',
  lon: 49,
  lat: 2.5,
  geoDepartement: '69',
}

describe('Test departements controllers', () => {
  beforeAll(async () => {
    await connect()
    await createCentres()
    await createDepartement({ _id: '69', email: '69@email.com', isAddedRecently: false, disableAt: '2022-12-01' })
    const {
      nom,
      label,
      adresse,
      lon,
      lat,
      departement,
      geoDepartement,
    } = centre69
    await createCentre(
      nom,
      label,
      adresse,
      lon,
      lat,
      departement,
      geoDepartement,
    )
    placesAndGeoDepartementsAndCentresCache.setDepartementInfos()
  })

  afterAll(async () => {
    await removeCentres()
    await disconnect()
  })

  it('should get departements Id', async () => {
    // GIVEN

    // WHEN
    const { body } = await request(app)
      .get(`${apiPrefix}/public/departements`)
      .set('Accept', 'application/json')
      .expect(200)

    // THEN
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('departementsId')
    expect(body.departementsId).toEqual(expect.arrayContaining(['93', '92']))
    expect(body.departementsId).toEqual(expect.not.arrayContaining(['69']))
  })
})
