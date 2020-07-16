import request from 'supertest'
import express from 'express'

import { createToken } from '../../util'

import { verifyToken, getToken } from './verify-token'

import { PLEASE_LOG_IN } from '../../messages.constants'

const id = 'fakeId'

const validToken = createToken(id, 'candidat')

const invalidToken = validToken + '0'
const verifyPath = '/verify'
const getTokenPatch = '/token'
const app = express()
app.get(verifyPath, verifyToken, (req, res) => res.json({ ok: true }))
app.get(getTokenPatch, getToken, (req, res) => res.json({ id: req.userId }))

describe('Verify-token', () => {
  it('Should respond a json with a message for missing token', async () => {
    // When
    const { body, status } = await request(app)
      .get(verifyPath)
      .set('Accept', 'application/json')

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', PLEASE_LOG_IN)
  })

  it('Should respond a json with a message for invalid token', async () => {
    // When
    const { body, status } = await request(app)
      .get(verifyPath)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${invalidToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty(
      'message',
      'Impossible de vérifier votre authentification. Veuillez vous reconnecter.',
    )
  })

  it('Should respond a 404', async () => {
    // When
    const { body, status } = await request(app)
      .get(verifyPath)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${validToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })

  it('Should get Id when us getToken ', async () => {
    // When
    const { body, status } = await request(app)
      .get(getTokenPatch)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${validToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('id', id)
  })

  it('Should get nothing when us getToken for invalid token ', async () => {
    // When
    const { body, status } = await request(app)
      .get(getTokenPatch)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${invalidToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toEqual({})
  })
})
