import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'
import bodyParser from 'body-parser'

import { verifyToken } from '../../middlewares'
import { verifyRepartiteurLevel } from './verify-user-level'
import { apiPrefix } from '../../../app'
import config from '../../../config'
import { verifyRepartiteurDepartement } from './verify-repartiteur-departement'

const basicData = {
  email: 'user@example.com',
  level: config.userStatusLevels[config.userStatuses.CANDIDAT],
}

const basicToken = jwt.sign(basicData, config.secret, {
  expiresIn: '30s',
})

const adminData = {
  email: 'admin@example.com',
  level: config.userStatusLevels[config.userStatuses.REPARTITEUR],
  departements: ['93', '64'],
}

const adminToken = jwt.sign(adminData, config.secret, {
  expiresIn: '30s',
})

const app = express()
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(verifyToken, verifyRepartiteurLevel(), verifyRepartiteurDepartement)
app.get(apiPrefix, (req, res) => res.json({ ok: true }))
app.post(apiPrefix, (req, res) => res.json({ ok: true }))

describe('Verify-repartiteur-departement', () => {
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

  it('Should respond a 401 if department is missing', async () => {
    // When
    const { body, status } = await request(app)
      .get(apiPrefix)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Accès interdit')
  })

  it('Should respond a 401 if department is unknown', async () => {
    // When
    const { body, status } = await request(app)
      .get(apiPrefix + '?departement=95')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Accès interdit')
  })

  it('POST: Should respond a 401 if department is missing', async () => {
    // When
    const { body, status } = await request(app)
      .post(apiPrefix)
      .send()
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Accès interdit')
  })

  it('POST: Should respond a 401 if department is unknown ', async () => {
    // When
    const { body, status } = await request(app)
      .post(apiPrefix)
      .send({
        departement: 95,
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)

    // Then
    expect(status).toBe(401)
    expect(body).toHaveProperty('success', false)
    expect(body).toHaveProperty('message', 'Accès interdit')
  })

  it('GET: Should respond a 200', async () => {
    // When
    const { body, status } = await request(app)
      .get(apiPrefix + '?departement=93')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)
    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })

  it('POST: Should respond a 200', async () => {
    // When
    const { body, status } = await request(app)
      .post(apiPrefix)
      .send({
        departement: '93',
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)
    // Then
    expect(status).toBe(200)
    expect(body).toHaveProperty('ok', true)
  })
})
