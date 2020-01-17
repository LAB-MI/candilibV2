import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'

import { createCentres, removeCentres } from '../../models/__tests__/centres'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const { default: app, apiPrefix } = require('../../app')

describe('Test departements controllers', () => {
  beforeAll(async () => {
    await connect()
    await createCentres()
  })

  afterAll(async () => {
    await removeCentres()
    await disconnect()
  })

  describe('departements', () => {
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
    })
  })
})
