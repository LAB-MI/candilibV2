import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'

import { verifyToken } from '../../middlewares'
import { apiPrefix } from '../../../app'
import config from '../../../config'
import { verifyAccessAurige } from './verify-access-aurige'

const adminData = {
  email: 'admin@example.com',
  level: config.userStatusLevels[config.userStatuses.DELEGUE],
  departements: ['93', '64'],
}

const adminToken = jwt.sign(adminData, config.secret, {
  expiresIn: '30s',
})

const techData = {
  email: 'admin@example.com',
  level: config.userStatusLevels[config.userStatuses.ADMIN],
  departements: ['93', '64'],
}

const techToken = jwt.sign(techData, config.secret, {
  expiresIn: '30s',
})

const app = express()
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(verifyToken, verifyAccessAurige)
app.get(apiPrefix, (req, res) => res.json({ ok: true }))

jest.mock('../../../util/logger')

describe('Verify-access-aurige', () => {
  afterAll(async () => {
    await app.close()
  })

  it('Should respond a 200 with admin no ask aurige', async () => {
    // When
    const { body, status } = await request(app)
      .get(apiPrefix)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })
  it('Should respond a 401 with admin and if a query for is aurige', async () => {
    // When
    const { body, status } = await request(app)
      .get(`${apiPrefix}?for=aurige`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Accès interdit')
  })

  it('Should respond a 200 with admin and if a query for is not aurige', async () => {
    // When
    const { body, status } = await request(app)
      .get(`${apiPrefix}?for=aurige1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })

  it('Should respond a 200 with tech and if a query for is not aurige', async () => {
    // When
    const { body, status } = await request(app)
      .get(`${apiPrefix}?for=aurige1`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${techToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })

  it('Should respond a 200 with tech and if a query for is aurige', async () => {
    // When
    const { body, status } = await request(app)
      .get(`${apiPrefix}?for=aurige`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${techToken}`)

    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })
})
