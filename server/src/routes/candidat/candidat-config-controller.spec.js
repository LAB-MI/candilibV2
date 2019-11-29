import express from 'express'
import request from 'supertest'

import { getCandidatConfig } from './candidat-config-controller'
import config from '../../config'

require('dotenv').config()

describe('config candidat', () => {
  it('should get config candidat', async () => {
    // GIVEN
    const app = express()
    app.get('/config', getCandidatConfig)
    const expectedLineDelay = config.LINE_DELAY

    // WHEN
    const { body } = await request(app)
      .get('/config')
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)

    // THEN
    expect(body).toHaveProperty('success', true)
    expect(body).toHaveProperty('config')
    expect(body.config).toHaveProperty('lineDelay', expectedLineDelay)
  })
})
