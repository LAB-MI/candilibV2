import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

import { verifyToken } from './verify-token'
import { apiPrefix } from '../app'
import config from '../config'

const validToken = jwt.sign(
  {
    email: 'admin@example.com',
    level: 0,
  },
  config.secret,
  {
    expiresIn: '30s',
  }
)

const invalidToken = validToken + '0'

describe('Verify-token', () => {
  it('Should respond a json with a message for missing token', async () => {
    // Given
    const app = express()
    app.use(verifyToken)

    // When
    const { body, status } = await request(app)
      .get(apiPrefix)
      .set('Accept', 'application/json')

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Token absent')
  })

  it('Should respond a json with a message for invalid token', async () => {
    // Given
    const app = express()
    app.use(verifyToken)

    // When
    const { body, status } = await request(app)
      .get(apiPrefix)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${invalidToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Token invalide')
  })

  it('Should respond a 404', async () => {
    // Given
    const app = express()
    app.use(verifyToken)
    app.get(apiPrefix, (req, res) => res.json({ ok: true }))

    // When
    const { body, status } = await request(app)
      .get(apiPrefix)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${validToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })
})
