import request from 'supertest'
import express from 'express'

import { createToken } from '../util'

import { verifyToken } from './verify-token'

const email = 'admin@example.com'

const validToken = createToken(email, 'candidat')

const invalidToken = validToken + '0'

const app = express()
app.use(verifyToken)
app.get('/', (req, res) => res.json({ ok: true }))

describe('Verify-token', () => {
  it('Should respond a json with a message for missing token', async () => {
    // When
    const { body, status } = await request(app)
      .get('/')
      .set('Accept', 'application/json')

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Token absent')
  })

  it('Should respond a json with a message for invalid token', async () => {
    // When
    const { body, status } = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${invalidToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Token invalide')
  })

  it('Should respond a 404', async () => {
    // When
    const { body, status } = await request(app)
      .get('/')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${validToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })
})
