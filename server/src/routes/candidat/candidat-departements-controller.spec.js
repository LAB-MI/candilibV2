import request from 'supertest'

import { connect, disconnect } from '../../mongo-connection'
import {
  createDepartement,
  deleteDepartementById,
} from '../../models/departement'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

const { default: app, apiPrefix } = require('../../app')

describe('Test departements controllers', () => {
  const departementData = { _id: '93', email: 'email93@onepiece.com' }
  beforeAll(async () => {
    await connect()
    await createDepartement(departementData)
  })

  afterAll(async () => {
    deleteDepartementById(departementData._id)
    await disconnect()
    // await app.close()
  })

  describe('departements', () => {
    it('should get departements Id', async () => {
      // GIVEN

      // WHEN
      const { body } = await request(app)
        .get(`${apiPrefix}/departements`)
        .set('Accept', 'application/json')
        // .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)

      // THEN
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('departementsId')
      console.log(body.departementsId)
      expect(body.departementsId[0]).toHaveProperty('_id', departementData._id)
    })
  })
})
