import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

import { verifyToken } from '../../middlewares'
import { verifyAdminLevel } from './verify-admin-level'
import { apiPrefix } from '../../../app'
import config from '../../../config'

const basicData = {
  email: 'user@example.com',
  level: 0,
}

const basicToken = jwt.sign(basicData, config.secret, {
  expiresIn: '30s',
})

const adminData = {
  email: 'admin@example.com',
  level: 1,
}

const adminToken = jwt.sign(adminData, config.secret, {
  expiresIn: '30s',
})

const app = express()
app.use(verifyToken, verifyAdminLevel)
app.get(apiPrefix, (req, res) => res.json({ ok: true }))

describe('Verify-token', () => {
  afterAll(async () => {
    await app.close()
  })

  it('Should respond a 401', async () => {
    // When
    const { body, status } = await request(app)
      .get(apiPrefix)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${basicToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Accès interdit')
  })

  it('Should respond a 200', async () => {
    // When
    const { body, status } = await request(app)
      .get(apiPrefix)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })
})
