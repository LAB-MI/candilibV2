import request from 'supertest'
// import express from 'express'

import { connect, disconnect } from '../../mongo-connection'
import {
  createDepartement,
  deleteDepartementById,
} from '../../models/departement'
// import { getDepartements } from './candidat-departements-controller'

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
    it('should get departements', async () => {
      // GIVEN

      // WHEN
      const { body } = await request(app)
        .get(`${apiPrefix}/departements`)
        .set('Accept', 'application/json')
        // .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)

      // THEN
      expect(body).toHaveProperty('success', true)
      expect(body).toHaveProperty('departements')
      // expect(body.departements).arrayContaining(
      //   expect.objectContaining(expect.toHaveProperty('nom'))
      // )
      console.log(body.departements)
      expect(body.departements[0]).toHaveProperty('_id', departementData._id)
    })
  })
})
