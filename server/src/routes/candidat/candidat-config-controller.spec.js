import express from 'express'
import request from 'supertest'

import { getCandidatConfig } from './candidat-config-controller'
require('dotenv').config()

describe('config candidat', () => {
  it('should get config candidat', async () => {
    // GIVEN
    const app = express()
    app.get('/config', getCandidatConfig)
    const expectedLineDelay = Number(process.env.LINE_DELAY) || 0

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
